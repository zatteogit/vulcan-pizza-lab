import type { CmsContent } from "../cms-context";
import {
  PRE_FERMENT_EN,
  DIETARY_EN,
  TROUBLESHOOTING_EN,
  GLOSSARY_TERMS_EN,
} from "./domain-en";

/**
 * English locale bundle — complete CmsContent override.
 *
 * Convention: every locale file exports a full CmsContent object.
 * The CMS switchLocale() function deep-merges the locale bundle
 * into the defaults, so only text/label fields change —
 * numeric values (weights, maxTemp, hours) stay untouched.
 */
export const EN_LOCALE: CmsContent = {
  locale: {
    id: "en",
    name: "English",
  },
  ui: {
    // Actions
    copy: "Copy",
    copied: "Copied!",
    share: "Share",
    back: "Back",
    reset: "Reset",
    close: "Close",
    modify: "Edit",
    disable: "Disable",
    restore: "Restore",
    generate: "Generate recipe",
    chooseStyle: "Choose style",
    customizeParams: "Customize parameters",
    changeStyle: "Change style",
    newPizza: "New pizza",
    // Recipe output
    ingredients: "Ingredients",
    procedure: "Method",
    steps_count: "{n} steps",
    doughBalls: "Dough balls",
    doughBallsFrom: "of {w}g each",
    totalDough: "total",
    startTime: "Start",
    endTime: "End",
    // Recipe output — clipboard/share text
    clipboardTitle: "{style} — Vulcan Pizza Lab",
    clipboardBalls: "{n} dough balls of {w}g",
    clipboardTotal: "Total: {g}g",
    clipboardProcedure: "{style} — Method",
    // Recipe output — ingredient names
    flour: "Flour",
    water: "Water",
    salt: "Salt",
    sugar: "Sugar",
    oilEvo: "Olive oil",
    // Recipe output — compensations
    compTitle: "Adjustments",
    compTitleNerd: "Oven compensations",
    compHydration:
      "Higher hydration to compensate for your oven",
    compOil: "A bit more oil to keep the pizza soft",
    compSugar: "Extra sugar for good browning",
    compCookTime: "Longer bake time for a perfect result",
    compThickness: "Thinner stretch for even baking",
    compDefault: "Parameter adjusted for your setup",
    // Recipe output — aria labels
    ariaReduceBalls: "Reduce number of dough balls",
    ariaAddBalls: "Increase number of dough balls",
    ariaEarlier: "Start earlier",
    ariaLater: "Start later",
    // Stat strip
    statHydration: "Hydration",
    statOven: "Oven",
    statCookTime: "Bake time",
    statFermentation: "Fermentation",
    statTempSuffix: "at {t}\u00B0C",
    // Nerd row
    nerdTitle: "Technical data",
    nerdFlourW: "Flour W",
    nerdPL: "P/L",
    nerdYeast: "Yeast",
    nerdHoursAt18: "Hrs @18\u00B0C",
    nerdQ10: "Q\u2081\u2080",
    nerdAw: "Aw",
    // Time format
    seconds: "seconds",
    minutes: "minutes",
    minute: "minute",
    hours: "hours",
    hour: "hour",
    // Score dashboard
    recipeScore: "Recipe score",
    nerdToggle: "PizzaNerd",
    nerdActive: "Activate PizzaNerd",
    scienceTitle: "Vulcan Science",
    ariaCloseScores: "Close scores panel",
    ariaViewScores: "View score details",
    tapForDetails: "Tap for details",
    // Banners
    styleEditorActive: "Style Editor active",
    cmsActive: "CMS active",
    fieldsModified: "fields modified",
    fieldModified: "field modified",
    editOven: "Edit oven",
    weatherCity: "Your city",
    weatherOutdoor: "{t}\u00B0C outside",
    weatherKitchen: "Kitchen temperature",
    badgeIdeal: "IDEAL",
    badgeRecent: "RECENT",
    autoLabel: "Auto",
    cancel: "Cancel",
    changeOven: "Change",
    ovenFallback: "Oven",
    pantryFlours: "Flours",
    pantryYeasts: "Yeasts",
    equipMixer: "Stand mixer",
    equipStone: "Pizza stone",
    equipSteel: "Baking steel",
    equipPan: "Baking pan",
    equipKneading: "Kneading",
    equipSurface: "Baking surface",
    kitchenTitle: "Your kitchen",
    pantryOptional: "optional",
    specialFlours: "Special flours",
    brandSuggest: "Know the brand?",
    badgeSelected: "Selected",
    otherCompatibleFlours: "Other compatible flours",
    flourSelectHint:
      "Select a flour to automatically update W and P/L in the recipe.",
    flourSelected: "Applied",
    autolysisSuggested: "Autolysis recommended",
    dietGlutenFree: "Gluten-free",
    dietLactoseFree: "Lactose-free",
    dietVegan: "Vegan",
    dietLowFodmap: "Low FODMAP",
    dietHistamine: "Low histamine",
    dietNickel: "Low nickel",
  },
  tips: {
    timeSlot:
      "Kitchen temperature affects rising times. The more time you have, the more options for light and digestible doughs.",
    skill:
      "We\u2019ll adjust the recipe complexity to your experience level.",
    equipment:
      "A stone or steel changes the crust. A baking pan is essential for styles like Teglia Romana or Detroit.",
    oven: "Your oven\u2019s maximum temperature determines which styles you can replicate at home.",
    pantry:
      "We\u2019ll tailor the recipe to your actual pantry: compatible flour and yeast type.",
  },
  hero: {
    title_line1: "Your",
    title_line2: "perfect pizza.",
    subtitle:
      "Tell us what you have and we\u2019ll guide you to the ideal style.",
  },
  steps: {
    context: {
      number: "01 \u2014 Context",
      title: "When & where",
      subtitle: "Time, temperature, environment",
    },
    setup: {
      number: "02 \u2014 Setup",
      title: "Your kitchen",
      subtitle: "Tools, experience, pantry",
    },
    styles: {
      number: "03 \u2014 Style",
      title: "Pick your style",
      subtitle: "Curated for your needs",
    },
  },
  sections: {
    when: {
      title: "When do you want pizza?",
      description:
        "Select the moment to calculate rising times",
    },
    skill: {
      title: "Experience level",
      description: "Helps us calibrate recipe complexity",
    },
    oven: {
      title: "Your oven",
      description: "Type and maximum temperature",
    },
    pantry: {
      title: "Pantry",
      description: "Flours and yeasts you have at home",
    },
    dietary: {
      title: "Dietary needs",
      description: "Optional filters",
    },
    equipment: {
      title: "Equipment",
      description: "What you have in your kitchen",
    },
  },
  timeSlots: {
    tonight: {
      label: "Tonight",
      sublabel: "4\u20136 hours",
      emoji: "\u{1F319}",
      hours: 5,
    },
    tomorrow_lunch: {
      label: "Tomorrow lunch",
      sublabel: "16\u201320 hours",
      emoji: "\u2600\uFE0F",
      hours: 18,
    },
    tomorrow_dinner: {
      label: "Tomorrow dinner",
      sublabel: "24\u201328 hours",
      emoji: "\u{1F306}",
      hours: 26,
    },
    day_after: {
      label: "Day after",
      sublabel: "40\u201348 hours",
      emoji: "\u{1F4C5}",
      hours: 44,
    },
    weekend: {
      label: "Weekend",
      sublabel: "72+ hours",
      emoji: "\u{1F389}",
      hours: 72,
    },
  },
  ovenPresets: {
    home: { name: "Home Oven", maxTemp: 250, icon: "home" },
    electric_standard: {
      name: "Standard Electric",
      maxTemp: 300,
      icon: "zap",
    },
    gas: {
      name: "Professional Gas",
      maxTemp: 350,
      icon: "flame",
    },
    electric_high: {
      name: "High-Temp Electric",
      maxTemp: 450,
      icon: "thermometer",
    },
    wood: {
      name: "Wood-Fired Oven",
      maxTemp: 500,
      icon: "flame-kindling",
    },
  },
  skillLevels: {
    "1": {
      name: "Beginner",
      description: "First pizza-making experiences",
    },
    "2": {
      name: "Intermediate",
      description: "I\u2019ve made pizza several times",
    },
    "3": {
      name: "Advanced",
      description: "I know the techniques and parameters",
    },
    "4": {
      name: "Expert",
      description: "Full mastery of techniques",
    },
  },
  families: {
    napoletana: {
      name: "Neapolitan",
      description:
        "Lightness, natural leavening, ultra-fast baking at extreme heat",
      emoji: "\u{1F1EE}\u{1F1F9}",
    },
    romana: {
      name: "Roman",
      description:
        "From the extreme crunch of Scrocchiarella to the high hydration of Teglia",
      emoji: "\u{1F3DB}\uFE0F",
    },
    americana: {
      name: "American",
      description:
        "Italian-American adaptation: practicality, street food, regional variety",
      emoji: "\u{1F5FD}",
    },
    contemporanea: {
      name: "Contemporary",
      description:
        "Digestibility, experimentation, high hydration, advanced techniques",
      emoji: "\u{1F52C}",
    },
  },
  allFamiliesLabel: "All families",
  tiers: {
    perfect: {
      label: "Perfect",
      subtitle: "maximum compatibility",
    },
    good: { label: "Good", subtitle: "great choice" },
    challenging: {
      label: "Challenging",
      subtitle: "for those who dare",
    },
  },
  scoreDimensions: {
    authenticity: {
      label: "Authenticity",
      short: "Auth",
      weight: 0.3,
    },
    feasibility: {
      label: "Feasibility",
      short: "Feas",
      weight: 0.25,
    },
    digestibility: {
      label: "Digestibility",
      short: "Dig",
      weight: 0.2,
    },
    sustainability: {
      label: "Sustainability",
      short: "Sus",
      weight: 0.15,
    },
    experimentation: {
      label: "Experimentation",
      short: "Exp",
      weight: 0.1,
    },
  },
  recommendationWeights: {
    time: 0.25,
    oven: 0.25,
    skill: 0.2,
    equipment: 0.1,
    pantry: 0.2,
  },
  media: {
    stylePhotos: {
      napoletana_stg:
        "https://images.unsplash.com/photo-1717883235373-ef10b2a745a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      napoletana_canotto:
        "https://images.unsplash.com/photo-1770670644186-b3d930f75f5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      teglia_romana:
        "https://images.unsplash.com/photo-1650327381366-c6dc88f8b9fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      tonda_romana:
        "https://images.unsplash.com/photo-1695457207327-2fe494a5aab8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      pinsa_romana:
        "https://images.unsplash.com/photo-1602658015824-b49d35094837?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      new_york:
        "https://images.unsplash.com/photo-1616141032335-7e6b413f93ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      detroit:
        "https://images.unsplash.com/photo-1684823906761-30fd02a961cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      chicago_deep:
        "https://images.unsplash.com/photo-1595378833483-c995dbe4d74f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      bonci_teglia:
        "https://images.unsplash.com/photo-1624323210664-3659370c9346?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      focaccia_genovese:
        "https://images.unsplash.com/photo-1770833047669-2db01dd791e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      sfincione:
        "https://images.unsplash.com/photo-1711805064484-a77096f599a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      pala_romana:
        "https://images.unsplash.com/photo-1614936686354-a490b8d90478?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      grandma_style:
        "https://images.unsplash.com/photo-1601387448308-66ae6aa1f1f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      focaccia_recco:
        "https://images.unsplash.com/photo-1751183295754-9cff9577a44e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      padellino_torino:
        "https://images.unsplash.com/photo-1626108962941-61b46dd705a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
    },
    fallbackPhoto:
      "https://images.unsplash.com/photo-1717883235373-ef10b2a745a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
  },
  result: {
    breadcrumb: "Your perfect pizza",
    heading: "Here\u2019s your recipe",
    backLabel: "Back to selection",
  },
  yeastLabels: {
    fresh: "Fresh yeast",
    dry: "Dry yeast",
    sourdough: "Sourdough starter",
  },
  yeastDetails: {
    fresh: "Classic cube",
    dry: "Convenient, long shelf life",
    sourdough: "Complex flavor, long maturation",
  },
  flourLabels: {
    "00": "Type 00 flour",
    "0": "Type 0 flour",
    manitoba: "Manitoba (bread flour)",
    integrale: "Whole wheat",
    semola: "Semolina",
  },
  flourDetails: {
    "00": "Classic, versatile",
    "0": "Medium strength",
    manitoba: "High strength, long maturation",
    integrale: "More fiber and flavor",
    semola: "Crunchiness, golden color",
  },
  filters: {
    advancedLabel: "Advanced filters",
    removeFilters: "Remove advanced filters",
    brandedFlours: "Brand-name flours",
    settingsOpen: "Settings",
    settingsClosed: "Your settings",
    hydrationLabel: "💧 Hydration",
    hydrationLow: "Low <60%",
    hydrationMedium: "Medium 60-70%",
    hydrationHigh: "High 70-85%",
    hydrationExtreme: "Extreme >85%",
    textureLabel: "🎯 Texture",
    textureCrispyThin: "Thin & crispy",
    textureThickAiry: "Thick & airy",
    textureAiryCrumb: "Open crumb",
    textureDeepDish: "Deep dish",
    skillLabel: "👨‍🍳 Skill level",
    skillBeginner: "Beginner",
    skillIntermediate: "Intermediate",
    skillAdvanced: "Advanced",
    skillExpert: "Expert",
    ovenLabel: "🔥 Baking",
    ovenHome: "Home oven",
    ovenWood: "Wood-fired",
    ovenElectricHigh: "Electric >350°C",
    ovenPan: "Pan-baked",
  },
  glossary: {
    pageTitle: "Technical Glossary",
    searchPlaceholder: "Search term, symbol or definition...",
    cancelSearch: "Clear",
    noResults: 'No terms found for "{query}"',
    allCategories: "All",
    formulaLabel: "Formula",
    rangesLabel: "Typical ranges",
    whyImportantLabel: "Why it matters",
    relatedLabel: "Related",
    backToHome: "Back to home",
    termCount: "{count} terms",
    catRheology: "Rheology",
    catRheologyDesc: "Mechanical properties of flour and dough",
    catFermentation: "Fermentation",
    catFermentationDesc:
      "Leavening, maturation and biological processes",
    catThermal: "Thermal",
    catThermalDesc: "Heat transfer and baking",
    catChemistry: "Chemistry",
    catChemistryDesc: "Composition and chemical reactions",
    catMechanics: "Mechanics",
    catMechanicsDesc: "Processing, equipment and measurements",
    catScoring: "Scores",
    catScoringDesc: "Vulcan quality metrics",
  },
  engineMessages: {
    "auth.hydrationOff": "Hydration off-centre (-{penalty}%)",
    "auth.wOutOfRange": "Flour W out of range (-{penalty}%)",
    "auth.plOutOfRange":
      "P/L {pl} out of range {plMin}-{plMax} (-{penalty}%)",
    "auth.notWoodOven": "Not a wood-fired oven (-15%)",
    "auth.tempVsIdeal":
      "Temperature {temp}°C vs {ideal}°C (-{penalty}%)",
    "auth.tempBelowMin":
      "Temperature below minimum (-{penalty}%)",
    "auth.fermentTooShort":
      "Fermentation too short (-{penalty}%)",
    "auth.fermentTooLong":
      "Fermentation too long (-{penalty}%)",
    "feas.ovenSuboptimal":
      "Oven sub-optimal: {temp}°C vs ideal {ideal}°C",
    "feas.ovenTooCold":
      "Oven too cold: {temp}°C < minimum {min}°C",
    "feas.wTooLow": "W too low: {w} < {wMin}",
    "feas.wTooHigh": "W very high ({w}). Tough dough.",
    "feas.hydrationBeginnerHigh":
      "Hydration >75% not recommended for beginners",
    "feas.hydrationNeedsPractice":
      "High hydration requires practice",
    "feas.hydrationMedBeginner":
      "Medium-high hydration for beginner",
    "feas.flourTooWeakForHydration":
      "Flour too weak for this hydration",
    "feas.prefermentNeedsExperience":
      "Pre-ferment requires experience",
    "dig.fermentTooShort":
      "Fermentation too short: starches not degraded",
    "dig.fermentShort":
      "Short fermentation: limited digestibility",
    "dig.fodmapReduced": "FODMAPs reduced ~{pct}%",
    "dig.fodmapHighReduction": "FODMAPs reduced >80%",
    "dig.extremeMaturation":
      "Extreme maturation: maximum aromatic complexity",
    "dig.highYeastDosage":
      "High yeast dosage ({pct}%): -{penalty}% digestibility",
    "dig.coldFermentation":
      "Cold fermentation: optimal enzymatic activity",
    "sust.quickCook": "Quick bake: low energy consumption",
    "sust.longCook": "Long bake: high energy consumption",
    "sust.ambientFerment":
      "Room-temperature fermentation: no fridge energy",
    "sust.pureDough":
      "Pure dough: just flour, water, salt, yeast",
    "sust.sourdoughZeroImpact":
      "Sourdough: home-made, zero impact",
    "rec.timeCompatible":
      "Fermentation {fMin}-{fMax}h: fits your schedule",
    "rec.timeAdaptable": "Fermentation adaptable to ~{hours}h",
    "rec.timeInsufficient":
      "Requires at least {fMin}h, you have {available}h",
    "rec.needsWoodOven": "Requires wood-fired oven",
    "rec.ovenIdeal":
      "Your oven reaches ideal temperature ({ideal}°C)",
    "rec.ovenAdequate":
      "Oven adequate (automatic time/temp compensation)",
    "rec.ovenTooCold": "Oven too cold: {temp}°C < min {min}°C",
    "rec.skillMatch": "Suited to your skill level",
    "rec.skillExpert": "Your skill level allows any style",
    "rec.hydrationNeedsPractice":
      "High hydration requires practice",
    "rec.advancedForBeginner": "Advanced style for beginners",
    "rec.noKneadNoMixer": "No mixer needed (no-knead)",
    "rec.handsHighHydration":
      "High hydration: hand-kneading very difficult",
    "rec.handsMedHydration":
      "Medium-high hydration: hand-kneading requires practice",
    "rec.forkIdealHighH": "Fork mixer ideal for high hydration",
    "rec.forkLowFriction": "Fork mixer: low thermal friction",
    "rec.spiralOptimal": "Professional spiral: optimal mixing",
    "rec.domesticStrugglesHighH":
      "Domestic stand mixer: may struggle with >80% hydration",
    "rec.mixerHelps": "Your mixer makes the process easier",
    "rec.mixerRecommended": "High hydration: mixer recommended",
    "rec.castIronPerfect": "Cast iron perfect for this style",
    "rec.panFits": "Pan suited for this style",
    "rec.needsPan": "Pan needed for this style",
    "rec.refractoryIdeal":
      "Refractory stone: ideal for Neapolitan",
    "rec.steelPlateCrispy":
      "Steel plate: crispy base in seconds",
    "rec.panPerfect": "Your pan is perfect for this style",
    "rec.flourMatch": "Pantry flour compatible",
    "rec.flourPartial": "Flour partially suited (W not ideal)",
    "rec.flourNoMatch": "No pantry flour in required W range",
    "rec.sourdoughLongFerment":
      "Sourdough ideal for long maturation",
    "rec.sourdoughOnlyShort":
      "Sourdough only: short fermentation difficult",
    "tip.waterTempCold":
      "Rule of 55: use fridge water ({temp}°C). Machine mixing heats the dough.",
    "tip.waterTempNormal":
      "Rule of 55: use water at {temp}°C to reach {ddt}°C dough temperature.",
    "tip.frictionNote":
      "Mixer friction compensation: {friction}°C",
  },
  scienceLabels: {
    yeastBaker: "Baker's yeast",
    effectiveHours: "Effective hours",
    q10Factor: "Q\u2081\u2080 factor",
    q10Cold: "cold",
    q10Sourdough: "sourdough",
    q10Standard: "std",
    waterActivity: "Water activity",
    glutenNetwork: "Gluten network",
    proteolysis: "Proteolysis",
    starchDegradation: "Starch degr.",
    fodmapReduction: "FODMAP reduction",
    plEstimated: "P/L estimated",
    bakingEnergy: "Baking energy",
    waterTemp: "Water temperature",
    desiredDoughTemp: "Dough temperature",
    frictionFactor: "Friction factor",
    deviationCategory: "Deviation",
    deviationScore: "Effective dev.",
  },
  timelineLabels: {
    preferment: {
      title: "Pre-Ferment",
      desc: "Mix {type} and let it mature",
      tipBeginner:
        'The pre-ferment is like an "appetizer" for the yeast. Mix and let it rest covered.',
      tipNerd:
        "The pre-ferment produces organic acids (lactic/acetic) that lower pH to ~4.5, improving the gluten network and shelf life.",
    },
    mix: {
      title: "Mixing",
      desc: "Knead until smooth and elastic.",
      descAlt:
        "Mix ingredients without kneading. Series of folds.",
      tipBeginner:
        "The dough is ready when it's smooth and pulls away from your hands. If too sticky, wait 5 min and try again.",
      tipNerd:
        "Window pane test confirms sufficient gluten development: glutenin and gliadin form stable disulfide bonds.",
    },
    mix_noknead: {
      title: "Mixing",
      desc: "Mix ingredients without kneading. Series of folds.",
      tipBeginner:
        "No kneading needed! Mix with a spatula until there are no more dry flour lumps.",
      tipNerd:
        "Autolyse leverages endogenous flour proteinases to develop gluten without mechanical work.",
    },
    bulk: {
      title: "Bulk Fermentation",
      desc: "Bulk rise at {temp}\u00B0C",
      tipBeginner:
        "The dough should double in volume. If it's warm, check more often!",
      tipNerd:
        "At {temp}\u00B0C fermentation speed is {factor}\u00D7 vs the 18\u00B0C reference.",
    },
    bulk_cold: {
      title: "Bulk Fermentation",
      desc: "Bulk rise at {temp}\u00B0C",
      tipBeginner:
        "In the fridge the dough rises slowly but gains flavor. Cover well with contact wrap.",
      tipNerd:
        "At {temp}\u00B0C Q\u2081\u2080\u22482.0 slows fermentation. Proteolytic activity dominates, degrading FODMAPs.",
    },
    divide: {
      title: "Dividing",
      desc: "Divide into balls of the correct weight. Shape into a ball.",
      tipBeginner:
        "Use a scale! Cut with a bench scraper and round each piece into a smooth ball.",
      tipNerd:
        "Dividing creates surface tension that traps CO\u2082 during proofing and defines the final alveolar structure.",
    },
    proof: {
      title: "Final Proof",
      desc: "Final rise at {temp}\u00B0C",
      tipBeginner:
        "The balls should be soft. If you press with a finger, they spring back slowly.",
      tipNerd:
        "Poke test: slow return = optimal fermentation. Too fast = under-proofed. No return = over-proofed.",
    },
    shape: {
      title: "Shaping",
      desc: "Stretch from center by hand, preserve the rim",
      descAlt: "Stretch in the oiled pan by hand",
    },
    shape_thin: {
      title: "Shaping",
      desc: "Roll out with a rolling pin, ultra-thin",
    },
    top: {
      title: "Topping",
      desc: "Top the pizza to taste",
    },
    bake: {
      title: "Baking",
      desc: "Bake at {temp}\u00B0C",
      tipBeginner:
        "The oven must be very hot. Preheat at least 30 minutes before.",
      tipNerd:
        "The Maillard reaction starts at ~140\u00B0C and accelerates exponentially. At {temp}\u00B0C caramelization creates ~600 aromatic compounds.",
    },
  },
  timelineUi: {
    startLabel: "Start",
    beforeSuffix: "before",
  },
  parametricTips: {
    pillHydration: "Hydration",
    pillFlour: "Flour",
    pillPL: "P/L",
    pillFermentation: "Fermentation",
    pillThickness: "Thickness",
    pillLevel: "Level",
    pillExperimentation: "Experimentation",
    pillLevelBeginner: "Beginner",
    pillLevelExpert: "Expert",
    sheetSectionTitle: "Baking Details",
    sheetOvenLabel: "Ideal oven",
    sheetOvenPreheat: "Preheat: {min} min",
    sheetBakeLabel: "Bake time",
    sheetBakeTurns: "{n} rotation(s)",
    sheetBakeNoTurns: "No rotation",
    sheetDoughLabel: "Dough ball",
    sheetSaltLabel: "Salt",
    sheetFoldLabel: "Folds",
    sheetFoldInterval: "Every {min} min",
    sheetGenerateBtn: "Generate recipe",
    sheetTechniquesLabel: "Compatible author techniques",
    mixBeginner: "{mixer} (~{time} min mixing). {equipment}",
    bulkBeginner:
      "Perform {count} folds ({type}) every {interval} minutes to develop structure.",
    shapeBeginner: "{note}",
    topBeginner: "Order: {order}. {note}",
    bakeBeginner: "Time: {minM}\u2013{maxM} min. {turnsNote}",
    mixNerd: "{mixer} \u00B7 mixing ~{time} min \u00B7 {note}",
    bulkNerd:
      "Folds: {count}\u00D7 {type} every {interval} min \u00B7 {note}",
    shapeNerd:
      "Scoring: {type} \u00B7 depth {depth}mm \u00B7 {timing} \u00B7 {note}",
    topNerd:
      "Topping order: {order} \u00B7 sauce {saucePos} \u00B7 {cheeseType} ({cheesePos}) \u00B7 {note}",
    bakeNerd:
      "Ideal bake: {idealSec}s (range {minM}\u2013{maxM} min) \u00B7 {turns} rotations \u00B7 {note}",
    mixerPlanetaria: "Stand mixer recommended",
    mixerHand: "Hand mixing possible",
    turnsSingle: "Rotate {n} time(s) for even baking.",
    turnsNone: "Do not rotate during baking.",
  },
  styleDescriptions: {
    napoletana_stg:
      "Golden standard per AVPN regulation. Puffy cornicione, thin centre, leopard-spotted crust.",
    napoletana_canotto:
      'Explosive "air canotto" cornicione, extreme alveolation, high digestibility.',
    teglia_romana:
      "High hydration, no-knead with folds. Crispy base, cloud-like crumb.",
    tonda_romana:
      'Ultra-thin, rolling pin required, extremely crispy. "Scrocchiarella".',
    pinsa_romana:
      "70% wheat / 15% soy / 15% rice blend. Oval shape, glassy crust.",
    pala_romana:
      "Elongated oval served on peel. Halfway between round and pan: crispy outside, cloud inside.",
    new_york:
      "Large foldable slice, crispy yet flexible crust. Street food.",
    detroit:
      "Crispy cheese crown, Blue Steel pan. Cheese pushed to the edges.",
    chicago_deep:
      "Deep-dish like a savoury pie. Inverted layers: cheese-filling-sauce.",
    bonci_teglia:
      "No-knead with folds, extreme hydration, maestro Bonci. High digestibility.",
    focaccia_genovese:
      "Soft and oily, with golden crust and signature dimples. Oil-water brine on top.",
    sfincione:
      "Thick Sicilian pizza with tomato, onion, anchovies, caciocavallo and breadcrumbs. Palermo street food.",
    grandma_style:
      "Thin, crispy, oiled pan. Italian-American grandma's pizza. Mozzarella under, sauce on top.",
    focaccia_recco:
      "Two paper-thin sheets with melted stracchino. IGP since 2015. Signature golden bubbles.",
    padellino_torino:
      "Baked in cast-iron pan, finished in oven. Crispy butter-oil bottom, soft centre. Turin specialty.",
  },
  styleChars: {
    napoletana_stg:
      "Cornicione 1-2cm puffy|Centre 3-4mm thin|Leopard-spotted crust|Bake 60-90s",
    napoletana_canotto:
      'Cornicione 3-4cm "canotto"|Extreme alveolation|24-72h maturation|High digestibility',
    teglia_romana:
      "Height 2-3cm|Hydration 80-100%|No-knead + folds|Cloud crumb",
    tonda_romana:
      "Thickness 1-2mm|Rolling pin required|Extremely crispy|Weak flour W<210",
    pinsa_romana:
      "Multi-grain mix|Oval shape|Glassy crust|24-72h maturation",
    pala_romana:
      "Elongated oval shape|High hydration|Served on peel|Crispy-cloud crust",
    new_york:
      "Foldable slice|Sugar + oil|Bake 12-15min|Signature oiliness",
    detroit:
      "Cheese crown|Deep pan|Cheese to edges|Caramelised crust",
    chicago_deep:
      "5cm depth|18% butter|Inverted layers|Bake 35min",
    bonci_teglia:
      "No-knead + folds|Extreme hydration|24-72h maturation|Cloud alveolation",
    focaccia_genovese:
      "Generous EVO oil|Surface dimples|Oil-water brine|Bake 15-20min",
    sfincione:
      "Thick and fluffy|Toasted breadcrumbs|Onion + anchovies|Caciocavallo",
    grandma_style:
      "Thin and crispy|Mozzarella under sauce|Well-oiled pan|Bake 12-16min",
    focaccia_recco:
      "Almost transparent sheet|Stracchino filling|Golden bubbles|No leavening",
    padellino_torino:
      "Cast-iron pan|Ultra-crispy bottom|Soft centre|Individual portion",
  },
  deviationLabels: {
    canonical: "Canonical",
    parameter_variant: "Parameter variation",
    technique_variant: "Technique variant",
    hybrid: "Hybridisation",
    experimental: "Experimental",
  },
  authorNames: {
    bonci_no_knead: "No-Knead High Hydration",
    martucci_biga_ibrida: "Hybrid Biga 50% + Autolyse",
    martucci_biga_100: "100% Biga with Refresh",
    pepe_sensoriale: "Sensory Hydration",
    bosco_idrolisi:
      "Hydrolysis Method (Spontaneous Fermentation)",
    capuano_forbici: "Scissors Method (Dairy)",
    pepe_sensory_layering: "Separate Ingredient Baking",
    bianco_long_ferment: "5-Day Fermentation",
    forkish_saturday: "Saturday Pizza (Cold Fermentation)",
  },
  authorAuthors: {
    bonci_no_knead: "Gabriele Bonci",
    martucci_biga_ibrida: "Francesco Martucci",
    martucci_biga_100: "Francesco Martucci",
    pepe_sensoriale: "Franco Pepe",
    bosco_idrolisi: "Renato Bosco",
    capuano_forbici: "Vincenzo Capuano",
    pepe_sensory_layering: "Franco Pepe",
    bianco_long_ferment: "Chris Bianco",
    forkish_saturday: "Ken Forkish",
  },
  profile: {
    pageTitle: "Your Profile",
    pageSubtitle: "Your preferences, always at hand.",
    ovenTitle: "Your oven",
    ovenSubtitle:
      "Determines temperatures and available styles",
    ovenStep: "01 — Equipment",
    tempLabel: "Max temperature",
    tempAria: "Maximum oven temperature",
    skillTitle: "Your experience",
    skillSubtitle: "We'll adjust recipe complexity",
    skillStep: "02 — Skill level",
    pantryTitle: "Your pantry",
    pantrySubtitle: "Flours and yeasts you have at home",
    pantryStep: "03 — Ingredients",
    dietTitle: "Dietary preferences",
    dietSubtitle: "Filter incompatible styles and ingredients",
    dietStep: "04 — Diet",
    noDietNote: "No restrictions — all styles available.",
    prefsTitle: "Language & theme",
    prefsSubtitle: "Customize the interface",
    prefsStep: "05 — Preferences",
    langLabel: "Language",
    themeLabel: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    resetProfile: "Reset profile",
    devModeOn: "Dev mode active",
    devModeOff: "Enable dev mode",
    ftuWelcome: "Welcome",
    ftuOvenTitle: "What oven do you have?",
    ftuOvenSubtitle:
      "Your oven defines which styles are possible",
    ftuSkillTitle: "How experienced are you?",
    ftuSkillSubtitle: "We'll guide you at the right level",
    ftuPantryTitle: "What's in your pantry?",
    ftuPantrySubtitle: "Flours and yeasts available",
    ftuBack: "Back",
    ftuNext: "Next",
    ftuStart: "Let's go",
    localeModalTitle: "Change language?",
    localeModalDesc:
      "All interface text will switch from {from} to {to}.",
    localeModalCancel: "Cancel",
    localeModalConfirm: "Confirm",
    flour00: "Type 00",
    flour0: "Type 0",
    flourManitoba: "Manitoba",
    flourIntegrale: "Wholegrain",
    flourSemola: "Durum semolina",
    yeastFresh: "Fresh yeast",
    yeastDry: "Dry yeast",
    yeastSourdough: "Sourdough starter",
    dietGlutenFree: "Gluten-free",
    dietLactoseFree: "Lactose-free",
    dietVegan: "Vegan",
    dietLowFodmap: "Low FODMAP",
    dietHistamine: "Low histamine",
    dietNickel: "Low nickel",
    equipTitle: "Equipment",
    equipSubtitle: "What's in your kitchen",
    equipStep: "03 — Equipment",
    equipMixerTitle: "Kneading",
    equipSurfaceTitle: "Baking surface",
    equipToolsTitle: "Tools",
    equipSummaryNone: "Not selected",
    equipSummarySelected: "{count} selected",
    mixerHands: "By hand",
    mixerHandsDesc: "Manual kneading, no equipment",
    mixerStandDomestic: "Stand mixer (home)",
    mixerStandDomesticDesc:
      "KitchenAid, Kenwood, Smeg — 4-7 L, dough hook",
    mixerPlanetary: "Planetary mixer (semi-pro)",
    mixerPlanetaryDesc: "10-20 L, spiral hook, 500W+ motor",
    mixerSpiral: "Spiral mixer",
    mixerSpiralDesc: "Fixed/tilting bowl, professional",
    mixerFork: "Fork mixer",
    mixerForkDesc:
      "Slow, low friction — ideal for high hydration",
    mixerLevelHome: "Home",
    mixerLevelSemiPro: "Semi-Pro",
    mixerLevelPro: "Pro",
    surfaceRefractory: "Refractory brick",
    surfaceRefractoryDesc:
      "3 cm, high thermal mass — wood & prosumer ovens",
    surfaceCordierite: "Cordierite stone",
    surfaceCordieriteDesc:
      "1.5 cm, mass/speed compromise — Effeuno, Ooni",
    surfaceSteel: "Steel plate",
    surfaceSteelDesc:
      "5-10 mm, ultra-fast transfer — crispy base in seconds",
    surfaceAluminum: "Aluminium pan",
    surfaceAluminumDesc:
      "Light, extreme conductivity — Detroit, Roman teglia",
    surfaceBlueSteel: "Blue steel pan",
    surfaceBlueSteelDesc:
      "Natural non-stick, high rim — teglia, focaccia",
    surfaceCastIron: "Cast iron skillet",
    surfaceCastIronDesc:
      "High thermal mass, high rim — Chicago, padellino",
    surfaceOvenRack: "Oven rack",
    surfaceOvenRackDesc:
      "No extra surface — standard oven rack only",
    toolCatEssential: "Essential",
    toolCatPrecision: "Precision",
    toolCatHandling: "Handling",
    toolCatContainment: "Containment",
    toolDigitalScale: "Digital scale",
    toolDigitalScaleDesc: "1g precision, 5kg+ capacity",
    toolThermometer: "Thermometer",
    toolThermometerDesc: "IR or probe, for dough and oven",
    toolScraper: "Scraper",
    toolScraperDesc: "Flexible plastic for folds and cutting",
    toolContainers: "Proofing containers",
    toolContainersDesc: "Stackable trays or lidded bowls",
    toolDoughCutter: "Dough cutter",
    toolDoughCutterDesc:
      "Stainless steel, for precise portioning",
    toolBenchKnife: "Bench knife",
    toolBenchKnifeDesc:
      "Stainless steel, for flipping high-hydration doughs",
    toolScoringBlade: "Scoring blade",
    toolScoringBladeDesc: "For decorative surface cuts",
    toolPeelWood: "Wooden peel",
    toolPeelWoodDesc:
      "For loading — low friction with semolina",
    toolPeelMetal: "Metal peel",
    toolPeelMetalDesc:
      "For turning and unloading — thin and reactive",
    toolPizzaScreen: "Pizza screen",
    toolPizzaScreenDesc:
      "Perforated aluminium for crispy baking",
    toolProofingBoxes: "Proofing boxes",
    toolProofingBoxesDesc:
      "Stackable with lid — 30×40 or 40×60 cm",
    toolBannetons: "Bannetons",
    toolBannetonsDesc: "For round shapes, with linen liner",
  },
  pages: {
    navCreate: "Create",
    navExplore: "Styles",
    navLearn: "Learn",
    navProfile: "Profile",
    navSearch: "Search",
    exploreStepNum: "15 styles — 4 families",
    exploreTitle: "Explore Styles",
    exploreSubtitle:
      "From Neapolitan STG to Focaccia di Recco.",
    learnTitle: "Learn",
    learnSubtitle:
      "The science and art of pizza, explained well.",
    learnGlossary: "Glossary",
    learnGlossaryDesc: "30+ technical baking terms",
    learnTroubleshooting: "Problems & Solutions",
    learnTroubleshootingDesc:
      "20 common problems and how to fix them",
    learnPreFerments: "Pre-ferments",
    learnPreFermentsDesc: "Guide to Biga, Poolish and Autolyse",
    recipeLabel: "Recipe",
    recipeBackToStyles: "Styles",
    recipeStyleNotFound: "Style not found",
    recipeStyleNotFoundDesc:
      'The style "{id}" does not exist in the database.',
    recipeExploreStyles: "Explore styles",
    recipeCopyLinkAria: "Copy recipe link",
    notFoundTitle: "Page not found",
    notFoundSubtitle: "This pizza doesn't exist on our menu.",
    notFoundBack: "Back to home",
    searchPlaceholder:
      "Search style, flour, term, problem\u2026",
    searchCatStyles: "Styles",
    searchCatFlours: "Flours",
    searchCatGlossary: "Glossary",
    searchCatProblems: "Problems",
    searchCatGuides: "Guides",
    searchNoResults: 'No results for "{query}"',
    searchHint:
      "Type to search styles, flours, glossary and problems",
    searchSuggestions: "Suggestions",
    searchFlourWheat: "Soft wheat",
    searchFlourManitoba: "Manitoba",
    searchFlourSemola: "Semolina",
    searchFlourWholegrain: "Wholegrain",
    searchFlourGlutenFree: "Gluten-free",
    searchFlourSpecial: "Special",
    skipToContent: "Skip to content",
    navMainLabel: "Main navigation",
    searchCloseLabel: "Close search",
    searchFieldLabel: "Global search field",
    searchClearLabel: "Clear search",
    dietaryWarningsTitle: "Dietary warnings",
    troubleshootingTitle: "Issues with the recipe?",
    troubleshootingDesc:
      "Check our guide to 20 common problems and solutions",
  },
  configurator: {
    hydrationLabel: "Hydration",
    hydrationTip:
      "Water percentage relative to flour. Higher = softer dough and open crumb, but harder to handle.",
    flourWLabel: "Flour Strength (W)",
    flourWTip:
      "Measures the flour's ability to absorb water and retain gas. Higher W = longer fermentations and stronger structure.",
    plLabel: "P/L Ratio",
    plTip:
      "Alveograph tenacity/extensibility ratio. Low P/L = extensible dough (round pizza). High P/L = tenacious dough (long fermentation). Estimated from W if not manually set.",
    fermentLabel: "Fermentation",
    fermentTip:
      "Total proofing time. More hours at lower temperatures = more complex flavour and better digestibility.",
    tempFridge: "4\u00B0C fridge",
    tempCool: "12\u00B0C",
    tempAmbient: "22\u00B0C room",
    preFermentLabel: "Pre-ferment",
    preFermentTip:
      "A pre-ferment (biga, poolish) is a portion of dough fermented in advance. Improves flavour, digestibility and shelf life. Requires 12\u201324 h extra planning.",
    ovenLabel: "Oven",
    ovenTip:
      "Select the type and adjust the temperature. Higher temperatures = faster bake and better crust.",
    panLabel: "Pan",
    panTipRect:
      "Pan shape and size affect dough quantity and the final result. The standard for this style is rectangular.",
    panTipRound:
      "Pan shape and size affect dough quantity and the final result. The standard for this style is round.",
    panRectangular: "Rectangular",
    panRound: "Round",
    panLength: "Length",
    panWidth: "Width",
    panDiameter: "Diameter",
    panArea: "Pan area",
    thicknessLabel: "Thickness",
    thicknessTip:
      "Pizza thickness directly affects dough weight per ball, baking and final texture. Lower values = thin and crispy. Higher values = soft and thick.",
    thicknessThin: "Thin and crispy",
    thicknessThick: "Thick and fluffy",
    thicknessStandard: "Standard for this style",
    backLabel: "Back",
    sliderOptimal: "optimal",
    hintHighHydrationNeedsW:
      "At {h}% hydration, you need strong flour: recommended W ≥ {w}",
    hintLowWLimitsHydration:
      "With W {w}, max recommended hydration is ~{h}%",
    hintLongFermentUseFridge:
      "With {hours}h fermentation, use the fridge (4°C) to control the dough",
    hintShortFermentUseWarm:
      "With only {hours}h, ferment at room temperature (22°C) to activate yeast",
    hintMediumFermentUseCool:
      "With {hours}h, a cool spot (12°C) is the ideal compromise between control and activity",
    hintHighHydrationNeedsTime:
      "At {h}% hydration, recommended fermentation ≥ {hours}h",
    hintLowPLForHighHydration:
      "With high hydration, recommended P/L ≤ {pl} for extensibility",
    hintHighWAllowsMoreHydration:
      "With W {w}, you can go up to {h}% hydration",
    hintAdaptiveLabel: "suggested",
    hintLimitMinLabel: "min limit",
    hintLimitMaxLabel: "max limit",
  },
  preFerment: PRE_FERMENT_EN as any,
  dietaryI18n: DIETARY_EN as any,
  troubleshootingI18n: TROUBLESHOOTING_EN as any,
  glossaryTerms: GLOSSARY_TERMS_EN as any,
};