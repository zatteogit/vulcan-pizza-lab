import type { CmsContent } from "../cms-context";
import {
  PRE_FERMENT_FR,
  DIETARY_FR,
  TROUBLESHOOTING_FR,
  GLOSSARY_TERMS_FR,
} from "./domain-fr";

/** French locale bundle */
export const FR_LOCALE: CmsContent = {
  locale: { id: "fr", name: "Fran\u00E7ais" },
  ui: {
    copy: "Copier",
    copied: "Copi\u00E9 !",
    share: "Partager",
    back: "Retour",
    reset: "R\u00E9initialiser",
    close: "Fermer",
    modify: "Modifier",
    disable: "D\u00E9sactiver",
    restore: "Restaurer",
    generate: "G\u00E9n\u00E9rer la recette",
    chooseStyle: "Choisir un style",
    customizeParams: "Personnaliser les param\u00E8tres",
    changeStyle: "Changer de style",
    newPizza: "Nouvelle pizza",
    ingredients: "Ingr\u00E9dients",
    procedure: "M\u00E9thode",
    steps_count: "{n} \u00E9tapes",
    doughBalls: "P\u00E2tons",
    doughBallsFrom: "de {w}g chacun",
    totalDough: "total",
    startTime: "D\u00E9but",
    endTime: "Fin",
    clipboardTitle: "{style} \u2014 Vulcan Pizza Lab",
    clipboardBalls: "{n} p\u00E2tons de {w}g",
    clipboardTotal: "Total : {g}g",
    clipboardProcedure: "{style} \u2014 M\u00E9thode",
    flour: "Farine",
    water: "Eau",
    salt: "Sel",
    sugar: "Sucre",
    oilEvo: "Huile d\u2019olive",
    compTitle: "Ajustements",
    compTitleNerd: "Compensations du four",
    compHydration:
      "Hydratation augment\u00E9e pour compenser votre four",
    compOil:
      "Un peu plus d\u2019huile pour garder la pizza moelleuse",
    compSugar: "Plus de sucre pour un bon dorage",
    compCookTime:
      "Cuisson plus longue pour un r\u00E9sultat parfait",
    compThickness:
      "\u00C9talage plus fin pour une cuisson uniforme",
    compDefault:
      "Param\u00E8tre adapt\u00E9 \u00E0 votre configuration",
    ariaReduceBalls: "R\u00E9duire le nombre de p\u00E2tons",
    ariaAddBalls: "Augmenter le nombre de p\u00E2tons",
    ariaEarlier: "Commencer plus t\u00F4t",
    ariaLater: "Commencer plus tard",
    statHydration: "Hydratation",
    statOven: "Four",
    statCookTime: "Cuisson",
    statFermentation: "Fermentation",
    statTempSuffix: "\u00E0 {t}\u00B0C",
    nerdTitle: "Donn\u00E9es techniques",
    nerdFlourW: "Farine W",
    nerdPL: "P/L",
    nerdYeast: "Levure",
    nerdHoursAt18: "Hrs @18\u00B0C",
    nerdQ10: "Q\u2081\u2080",
    nerdAw: "Aw",
    seconds: "secondes",
    minutes: "minutes",
    minute: "minute",
    hours: "heures",
    hour: "heure",
    recipeScore: "Score de la recette",
    nerdToggle: "PizzaNerd",
    nerdActive: "Activer PizzaNerd",
    scienceTitle: "Vulcan Science",
    ariaCloseScores: "Fermer le panneau des scores",
    ariaViewScores: "Voir les d\u00E9tails du score",
    tapForDetails: "Appuyez pour les d\u00E9tails",
    styleEditorActive: "Style Editor actif",
    cmsActive: "CMS actif",
    fieldsModified: "champs modifi\u00E9s",
    fieldModified: "champ modifi\u00E9",
    editOven: "Modifier le four",
    weatherCity: "Votre ville",
    weatherOutdoor: "{t}\u00B0C dehors",
    weatherKitchen: "Temp\u00E9rature cuisine",
    badgeIdeal: "ID\u00C9AL",
    badgeRecent: "R\u00C9CENT",
    autoLabel: "Auto",
    cancel: "Annuler",
    changeOven: "Changer",
    ovenFallback: "Four",
    pantryFlours: "Farines",
    pantryYeasts: "Levures",
    equipMixer: "P\u00E9trin",
    equipStone: "Pierre r\u00E9fractaire",
    equipSteel: "Plaque en acier",
    equipPan: "Plaque de cuisson",
    equipKneading: "Pétrissage",
    equipSurface: "Surface de cuisson",
    kitchenTitle: "Votre cuisine",
    pantryOptional: "optionnel",
    specialFlours: "Farines spéciales",
    brandSuggest: "Connaissez-vous la marque ?",
    badgeSelected: "Sélectionnée",
    otherCompatibleFlours: "Autres farines compatibles",
    flourSelectHint:
      "Sélectionnez une farine pour mettre à jour automatiquement W et P/L de la recette.",
    flourSelected: "Appliquée",
    autolysisSuggested: "Autolyse recommandée",
    dietGlutenFree: "Sans gluten",
    dietLactoseFree: "Sans lactose",
    dietVegan: "V\u00E9gan",
    dietLowFodmap: "Pauvre en FODMAP",
    dietHistamine: "Faible en histamine",
    dietNickel: "Faible en nickel",
  },
  tips: {
    timeSlot:
      "La temp\u00E9rature de la cuisine influence les temps de fermentation. Plus vous avez de temps, plus d\u2019options pour des p\u00E2tes l\u00E9g\u00E8res et digestibles.",
    skill:
      "Nous adapterons la complexit\u00E9 de la recette \u00E0 votre niveau d\u2019exp\u00E9rience.",
    equipment:
      "Une pierre ou une plaque changent la cro\u00FBte. La plaque \u00E0 p\u00E2tisserie est essentielle pour les styles comme Teglia Romana ou Detroit.",
    oven: "La temp\u00E9rature maximale de votre four d\u00E9termine quels styles vous pouvez reproduire chez vous.",
    pantry:
      "Nous adapterons la recette \u00E0 votre garde-manger r\u00E9el : farine compatible et type de levure.",
  },
  hero: {
    title_line1: "Votre",
    title_line2: "pizza parfaite.",
    subtitle:
      "Dites-nous ce que vous avez et nous vous guiderons vers le style id\u00E9al.",
  },
  steps: {
    context: {
      number: "01 \u2014 Contexte",
      title: "Quand & o\u00F9",
      subtitle: "Temps, temp\u00E9rature, environnement",
    },
    setup: {
      number: "02 \u2014 Setup",
      title: "Votre cuisine",
      subtitle: "Outils, exp\u00E9rience, garde-manger",
    },
    styles: {
      number: "03 \u2014 Style",
      title: "Choisissez votre style",
      subtitle: "S\u00E9lectionn\u00E9s pour vous",
    },
  },
  sections: {
    when: {
      title: "Quand voulez-vous de la pizza ?",
      description:
        "S\u00E9lectionnez le moment pour calculer les temps de fermentation",
    },
    skill: {
      title: "Niveau d\u2019exp\u00E9rience",
      description:
        "Nous aide \u00E0 calibrer la complexit\u00E9 des recettes",
    },
    oven: {
      title: "Votre four",
      description: "Type et temp\u00E9rature maximale",
    },
    pantry: {
      title: "Garde-manger",
      description: "Farines et levures que vous avez chez vous",
    },
    dietary: {
      title: "Besoins alimentaires",
      description: "Filtres optionnels",
    },
    equipment: {
      title: "\u00C9quipement",
      description: "Ce que vous avez dans votre cuisine",
    },
  },
  timeSlots: {
    tonight: {
      label: "Ce soir",
      sublabel: "4\u20136 heures",
      emoji: "\u{1F319}",
      hours: 5,
    },
    tomorrow_lunch: {
      label: "Demain midi",
      sublabel: "16\u201320 heures",
      emoji: "\u2600\uFE0F",
      hours: 18,
    },
    tomorrow_dinner: {
      label: "Demain soir",
      sublabel: "24\u201328 heures",
      emoji: "\u{1F306}",
      hours: 26,
    },
    day_after: {
      label: "Apr\u00E8s-demain",
      sublabel: "40\u201348 heures",
      emoji: "\u{1F4C5}",
      hours: 44,
    },
    weekend: {
      label: "Week-end",
      sublabel: "72+ heures",
      emoji: "\u{1F389}",
      hours: 72,
    },
  },
  ovenPresets: {
    home: {
      name: "Four domestique",
      maxTemp: 250,
      icon: "home",
    },
    electric_standard: {
      name: "\u00C9lectrique standard",
      maxTemp: 300,
      icon: "zap",
    },
    gas: {
      name: "Gaz professionnel",
      maxTemp: 350,
      icon: "flame",
    },
    electric_high: {
      name: "\u00C9lectrique haute temp.",
      maxTemp: 450,
      icon: "thermometer",
    },
    wood: {
      name: "Four \u00E0 bois",
      maxTemp: 500,
      icon: "flame-kindling",
    },
  },
  skillLevels: {
    "1": {
      name: "D\u00E9butant",
      description: "Premi\u00E8res exp\u00E9riences en pizza",
    },
    "2": {
      name: "Interm\u00E9diaire",
      description: "J\u2019ai fait de la pizza plusieurs fois",
    },
    "3": {
      name: "Avanc\u00E9",
      description:
        "Je connais les techniques et les param\u00E8tres",
    },
    "4": {
      name: "Expert",
      description: "Ma\u00EEtrise compl\u00E8te des techniques",
    },
  },
  families: {
    napoletana: {
      name: "Napolitaine",
      description:
        "L\u00E9g\u00E8ret\u00E9, levain naturel, cuisson ultra-rapide \u00E0 chaleur extr\u00EAme",
      emoji: "\u{1F1EE}\u{1F1F9}",
    },
    romana: {
      name: "Romaine",
      description:
        "Du croustillant extr\u00EAme de la Scrocchiarella \u00E0 la haute hydratation de la Teglia",
      emoji: "\u{1F3DB}\uFE0F",
    },
    americana: {
      name: "Am\u00E9ricaine",
      description:
        "Adaptation italo-am\u00E9ricaine : praticit\u00E9, street food, vari\u00E9t\u00E9 r\u00E9gionale",
      emoji: "\u{1F5FD}",
    },
    contemporanea: {
      name: "Contemporaine",
      description:
        "Digestibilit\u00E9, exp\u00E9rimentation, haute hydratation, techniques avanc\u00E9es",
      emoji: "\u{1F52C}",
    },
  },
  allFamiliesLabel: "Toutes les familles",
  tiers: {
    perfect: {
      label: "Parfaits",
      subtitle: "compatibilit\u00E9 maximale",
    },
    good: { label: "Bons", subtitle: "excellent choix" },
    challenging: {
      label: "Ambitieux",
      subtitle: "pour les audacieux",
    },
  },
  scoreDimensions: {
    authenticity: {
      label: "Authenticit\u00E9",
      short: "Auth",
      weight: 0.3,
    },
    feasibility: {
      label: "Faisabilit\u00E9",
      short: "Fais",
      weight: 0.25,
    },
    digestibility: {
      label: "Digestibilit\u00E9",
      short: "Dig",
      weight: 0.2,
    },
    sustainability: {
      label: "Durabilit\u00E9",
      short: "Dur",
      weight: 0.15,
    },
    experimentation: {
      label: "Exp\u00E9rimentation",
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
    breadcrumb: "Votre pizza parfaite",
    heading: "Voici votre recette",
    backLabel: "Retour \u00E0 la s\u00E9lection",
  },
  yeastLabels: {
    fresh: "Levure fra\u00EEche",
    dry: "Levure s\u00E8che",
    sourdough: "Levain naturel",
  },
  yeastDetails: {
    fresh: "Cube classique",
    dry: "Pratique, longue conservation",
    sourdough: "Saveur complexe, longue maturation",
  },
  flourLabels: {
    "00": "Farine T45 (Tipo 00)",
    "0": "Farine T55 (Tipo 0)",
    manitoba: "Manitoba (force)",
    integrale: "Compl\u00E8te",
    semola: "Semoule",
  },
  flourDetails: {
    "00": "Classique, polyvalente",
    "0": "Force moyenne",
    manitoba: "Haute force, longue maturation",
    integrale: "Plus de fibres et de go\u00FBt",
    semola: "Croustillant, couleur dor\u00E9e",
  },
  filters: {
    advancedLabel: "Filtres avanc\u00E9s",
    removeFilters: "Supprimer les filtres",
    brandedFlours: "Farines de marque",
    settingsOpen: "Param\u00E8tres",
    settingsClosed: "Vos param\u00E8tres",
    hydrationLabel: "\uD83D\uDCA7 Hydratation",
    hydrationLow: "Basse <60%",
    hydrationMedium: "Moyenne 60-70%",
    hydrationHigh: "Haute 70-85%",
    hydrationExtreme: "Extr\u00EAme >85%",
    textureLabel: "\uD83C\uDFAF Texture",
    textureCrispyThin: "Fine croustillante",
    textureThickAiry: "\u00C9paisse a\u00E9r\u00E9e",
    textureAiryCrumb: "Alv\u00E9ol\u00E9e",
    textureDeepDish: "Deep dish",
    skillLabel: "\uD83D\uDC68\u200D\uD83C\uDF73 Niveau",
    skillBeginner: "D\u00E9butant",
    skillIntermediate: "Interm\u00E9diaire",
    skillAdvanced: "Avanc\u00E9",
    skillExpert: "Expert",
    ovenLabel: "\uD83D\uDD25 Cuisson",
    ovenHome: "Four maison",
    ovenWood: "Bois",
    ovenElectricHigh: "\u00C9lectrique >350\u00B0C",
    ovenPan: "Po\u00EAle",
  },
  glossary: {
    pageTitle: "Glossaire Technique",
    searchPlaceholder:
      "Rechercher terme, symbole ou d\u00E9finition...",
    cancelSearch: "Effacer",
    noResults:
      "Aucun terme trouv\u00E9 pour \u00AB{query}\u00BB",
    allCategories: "Tous",
    formulaLabel: "Formule",
    rangesLabel: "Plages typiques",
    whyImportantLabel: "Pourquoi c\u2019est important",
    relatedLabel: "Apparent\u00E9s",
    backToHome: "Retour \u00E0 l\u2019accueil",
    termCount: "{count} termes",
    catRheology: "Rh\u00E9ologie",
    catRheologyDesc:
      "Propri\u00E9t\u00E9s m\u00E9caniques de la farine et de la p\u00E2te",
    catFermentation: "Fermentation",
    catFermentationDesc:
      "Levage, maturation et processus biologiques",
    catThermal: "Thermique",
    catThermalDesc: "Transfert de chaleur et cuisson",
    catChemistry: "Chimie",
    catChemistryDesc: "Composition et r\u00E9actions chimiques",
    catMechanics: "M\u00E9canique",
    catMechanicsDesc:
      "Fa\u00E7onnage, \u00E9quipements et mesures",
    catScoring: "Scores",
    catScoringDesc: "M\u00E9triques de qualit\u00E9 Vulcan",
  },
  engineMessages: {
    "auth.hydrationOff":
      "Hydratation hors centre (-{penalty}%)",
    "auth.wOutOfRange": "W farine hors plage (-{penalty}%)",
    "auth.plOutOfRange":
      "P/L {pl} hors plage {plMin}-{plMax} (-{penalty}%)",
    "auth.notWoodOven": "Pas un four à bois (-15%)",
    "auth.tempVsIdeal":
      "Température {temp}°C vs {ideal}°C (-{penalty}%)",
    "auth.tempBelowMin":
      "Température sous le minimum (-{penalty}%)",
    "auth.fermentTooShort":
      "Fermentation trop courte (-{penalty}%)",
    "auth.fermentTooLong":
      "Fermentation trop longue (-{penalty}%)",
    "feas.ovenSuboptimal":
      "Four sous-optimal : {temp}°C vs idéal {ideal}°C",
    "feas.ovenTooCold":
      "Four trop froid : {temp}°C < minimum {min}°C",
    "feas.wTooLow": "W trop bas : {w} < {wMin}",
    "feas.wTooHigh": "W très élevé ({w}). Pâte tenace.",
    "feas.hydrationBeginnerHigh":
      "Hydratation >75% déconseillée pour débutants",
    "feas.hydrationNeedsPractice":
      "L'hydratation élevée nécessite de la pratique",
    "feas.hydrationMedBeginner":
      "Hydratation moyenne-haute pour débutant",
    "feas.flourTooWeakForHydration":
      "Farine trop faible pour cette hydratation",
    "feas.prefermentNeedsExperience":
      "Pré-ferment nécessite de l'expérience",
    "dig.fermentTooShort":
      "Fermentation trop courte : amidons non dégradés",
    "dig.fermentShort":
      "Fermentation courte : digestibilité limitée",
    "dig.fodmapReduced": "FODMAPs réduits ~{pct}%",
    "dig.fodmapHighReduction": "FODMAPs réduits >80%",
    "dig.extremeMaturation":
      "Maturation extrême : complexité aromatique maximale",
    "dig.highYeastDosage":
      "Dosage levure élevé ({pct}%) : -{penalty}% digestibilité",
    "dig.coldFermentation":
      "Fermentation froide : activité enzymatique optimale",
    "sust.quickCook":
      "Cuisson rapide : faible consommation énergétique",
    "sust.longCook":
      "Cuisson longue : consommation énergétique élevée",
    "sust.ambientFerment":
      "Fermentation ambiante : aucune consommation frigo",
    "sust.pureDough":
      "Pâte pure : farine, eau, sel, levure uniquement",
    "sust.sourdoughZeroImpact":
      "Levain : fait maison, impact zéro",
    "rec.timeCompatible":
      "Fermentation {fMin}-{fMax}h : compatible avec votre temps",
    "rec.timeAdaptable": "Fermentation adaptable à ~{hours}h",
    "rec.timeInsufficient":
      "Nécessite minimum {fMin}h, vous avez {available}h",
    "rec.needsWoodOven": "Nécessite un four à bois",
    "rec.ovenIdeal":
      "Votre four atteint la température idéale ({ideal}°C)",
    "rec.ovenAdequate":
      "Four adéquat (compensation automatique temps/température)",
    "rec.ovenTooCold":
      "Four trop froid : {temp}°C < min {min}°C",
    "rec.skillMatch": "Adapté à votre niveau",
    "rec.skillExpert":
      "Votre niveau permet n'importe quel style",
    "rec.hydrationNeedsPractice":
      "L'hydratation élevée nécessite de la pratique",
    "rec.advancedForBeginner": "Style avancé pour débutants",
    "rec.noKneadNoMixer": "Pas besoin de pétrin (no-knead)",
    "rec.handsHighHydration":
      "Hydratation élevée : pétrissage à la main très difficile",
    "rec.handsMedHydration":
      "Hydratation moyenne : pétrissage à la main demande de la pratique",
    "rec.forkIdealHighH":
      "Pétrin à fourche idéal pour haute hydratation",
    "rec.forkLowFriction":
      "Pétrin à fourche : faible friction thermique",
    "rec.spiralOptimal":
      "Spirale professionnelle : pétrissage optimal",
    "rec.domesticStrugglesHighH":
      "Pétrin domestique : peut peiner avec >80% d'hydratation",
    "rec.mixerHelps": "Votre pétrin facilite le processus",
    "rec.mixerRecommended":
      "Hydratation élevée : pétrin recommandé",
    "rec.castIronPerfect": "Fonte parfaite pour ce style",
    "rec.panFits": "Plaque adaptée à ce style",
    "rec.needsPan": "Plaque nécessaire pour ce style",
    "rec.refractoryIdeal":
      "Pierre réfractaire : idéale pour la napolitaine",
    "rec.steelPlateCrispy":
      "Plaque acier : fond croustillant en secondes",
    "rec.panPerfect": "Votre plaque est parfaite pour ce style",
    "rec.flourMatch": "Farine en stock compatible",
    "rec.flourPartial":
      "Farine partiellement adaptée (W non idéal)",
    "rec.flourNoMatch":
      "Aucune farine en stock dans la plage W requise",
    "rec.sourdoughLongFerment":
      "Levain idéal pour longue maturation",
    "rec.sourdoughOnlyShort":
      "Levain seul : fermentation courte difficile",
    "tip.waterTempCold":
      "Règle du 55 : utiliser l'eau du réfrigérateur ({temp}°C). Le pétrissage mécanique chauffe la pâte.",
    "tip.waterTempNormal":
      "Règle du 55 : utiliser l'eau à {temp}°C pour atteindre {ddt}°C de température de pâte.",
    "tip.frictionNote":
      "Compensation de friction du pétrin : {friction}°C",
  },
  scienceLabels: {
    yeastBaker: "Levure de boulanger",
    effectiveHours: "Heures effectives",
    q10Factor: "Facteur Q\u2081\u2080",
    q10Cold: "froid",
    q10Sourdough: "levain",
    q10Standard: "standard",
    waterActivity: "Activit\u00E9 de l\u2019eau",
    glutenNetwork: "R\u00E9seau de gluten",
    proteolysis: "Prot\u00E9olyse",
    starchDegradation: "D\u00E9grad. amidon",
    fodmapReduction: "R\u00E9duction FODMAP",
    plEstimated: "P/L estim\u00E9",
    bakingEnergy: "\u00C9nergie de cuisson",
    waterTemp: "Temp\u00E9rature de l'eau",
    desiredDoughTemp: "Temp\u00E9rature de la p\u00E2te",
    frictionFactor: "Facteur de friction",
    deviationCategory: "D\u00E9viation",
    deviationScore: "D\u00E9v. effective",
  },
  timelineLabels: {
    preferment: {
      title: "Pr\u00E9-Ferment",
      desc: "M\u00E9langer {type} et laisser m\u00FBrir",
      tipBeginner:
        'Le pr\u00E9-ferment est comme un "ap\u00E9ritif" pour la levure. M\u00E9langer et laisser reposer couvert.',
      tipNerd:
        "Le pr\u00E9-ferment produit des acides organiques (lactique/ac\u00E9tique) qui abaissent le pH \u00E0 ~4,5, am\u00E9liorant le r\u00E9seau de gluten.",
    },
    mix: {
      title: "P\u00E9trissage",
      desc: "P\u00E9trir jusqu'\u00E0 obtenir une p\u00E2te lisse et \u00E9lastique.",
      descAlt:
        "M\u00E9langer les ingr\u00E9dients sans p\u00E9trir. S\u00E9rie de plis.",
      tipBeginner:
        "La p\u00E2te est pr\u00EAte quand elle est lisse et se d\u00E9tache des mains. Si trop collante, attendre 5 min et r\u00E9essayer.",
      tipNerd:
        "Le test du voile confirme le d\u00E9veloppement du gluten : glut\u00E9nine et gliadine forment des ponts disulfures stables.",
    },
    mix_noknead: {
      title: "M\u00E9lange",
      desc: "M\u00E9langer les ingr\u00E9dients sans p\u00E9trir. S\u00E9rie de plis.",
      tipBeginner:
        "Pas besoin de p\u00E9trir ! M\u00E9langer avec une spatule jusqu'\u00E0 disparition des grumeaux secs.",
      tipNerd:
        "L'autolyse exploite les prot\u00E9inases endog\u00E8nes de la farine pour d\u00E9velopper le gluten sans travail m\u00E9canique.",
    },
    bulk: {
      title: "Pointage",
      desc: "Fermentation en masse \u00E0 {temp}\u00B0C",
      tipBeginner:
        "La p\u00E2te doit doubler de volume. S'il fait chaud, v\u00E9rifier plus souvent !",
      tipNerd:
        "\u00C0 {temp}\u00B0C la vitesse de fermentation est {factor}\u00D7 par rapport \u00E0 la r\u00E9f\u00E9rence 18\u00B0C.",
    },
    bulk_cold: {
      title: "Pointage",
      desc: "Fermentation en masse \u00E0 {temp}\u00B0C",
      tipBeginner:
        "Au frigo la p\u00E2te monte lentement mais gagne en saveur. Bien couvrir avec un film au contact.",
      tipNerd:
        "\u00C0 {temp}\u00B0C le Q\u2081\u2080\u22482,0 ralentit la fermentation. L'activit\u00E9 prot\u00E9olytique domine, d\u00E9gradant les FODMAP.",
    },
    divide: {
      title: "Division",
      desc: "Diviser en p\u00E2tons du poids correct. Former une boule.",
      tipBeginner:
        "Utilisez une balance ! Couper avec un coupe-p\u00E2te et arrondir chaque morceau en boule lisse.",
      tipNerd:
        "La division cr\u00E9e une tension superficielle qui emprisonne le CO\u2082 pendant l'appr\u00EAt.",
    },
    proof: {
      title: "Appr\u00EAt",
      desc: "Fermentation finale \u00E0 {temp}\u00B0C",
      tipBeginner:
        "Les p\u00E2tons doivent \u00EAtre souples. Si vous pressez avec le doigt, ils reviennent lentement.",
      tipNerd:
        "Test du doigt : retour lent = fermentation optimale. Trop rapide = sous-ferment\u00E9. Pas de retour = sur-ferment\u00E9.",
    },
    shape: {
      title: "Fa\u00E7onnage",
      desc: "\u00C9taler \u00E0 la main depuis le centre, pr\u00E9server le bord",
      descAlt:
        "\u00C9taler dans le moule huil\u00E9 \u00E0 la main",
    },
    shape_thin: {
      title: "Fa\u00E7onnage",
      desc: "\u00C9taler au rouleau, ultrafine",
    },
    top: {
      title: "Garniture",
      desc: "Garnir la pizza selon vos go\u00FBts",
    },
    bake: {
      title: "Cuisson",
      desc: "Cuire \u00E0 {temp}\u00B0C",
      tipBeginner:
        "Le four doit \u00EAtre tr\u00E8s chaud. Pr\u00E9chauffer au moins 30 minutes avant.",
      tipNerd:
        "La r\u00E9action de Maillard d\u00E9marre \u00E0 ~140\u00B0C et acc\u00E9l\u00E8re exponentiellement. \u00C0 {temp}\u00B0C la caram\u00E9lisation cr\u00E9e ~600 compos\u00E9s aromatiques.",
    },
  },
  timelineUi: {
    startLabel: "D\u00E9but",
    beforeSuffix: "avant",
  },
  parametricTips: {
    pillHydration: "Hydratation",
    pillFlour: "Farine",
    pillPL: "P/L",
    pillFermentation: "Fermentation",
    pillThickness: "\u00C9paisseur",
    pillLevel: "Niveau",
    pillExperimentation: "Exp\u00E9rimentation",
    pillLevelBeginner: "D\u00E9butant",
    pillLevelExpert: "Expert",
    sheetSectionTitle: "D\u00E9tails de cuisson",
    sheetOvenLabel: "Four id\u00E9al",
    sheetOvenPreheat: "Pr\u00E9chauffage\u00A0: {min} min",
    sheetBakeLabel: "Temps de cuisson",
    sheetBakeTurns: "{n} rotation(s)",
    sheetBakeNoTurns: "Pas de rotation",
    sheetDoughLabel: "P\u00E2ton",
    sheetSaltLabel: "Sel",
    sheetFoldLabel: "Pliages",
    sheetFoldInterval: "Toutes les {min} min",
    sheetGenerateBtn: "G\u00E9n\u00E9rer la recette",
    sheetTechniquesLabel:
      "Techniques d\u2019auteur compatibles",
    mixBeginner:
      "{mixer} (~{time} min de p\u00E9trissage). {equipment}",
    bulkBeginner:
      "Effectuez {count} pliages ({type}) toutes les {interval} minutes pour d\u00E9velopper la structure.",
    shapeBeginner: "{note}",
    topBeginner: "Ordre\u00A0: {order}. {note}",
    bakeBeginner:
      "Temps\u00A0: {minM}\u2013{maxM} min. {turnsNote}",
    mixNerd:
      "{mixer} \u00B7 p\u00E9trissage ~{time} min \u00B7 {note}",
    bulkNerd:
      "Pliages\u00A0: {count}\u00D7 {type} toutes les {interval} min \u00B7 {note}",
    shapeNerd:
      "Grignes\u00A0: {type} \u00B7 profondeur {depth}mm \u00B7 {timing} \u00B7 {note}",
    topNerd:
      "Ordre garniture\u00A0: {order} \u00B7 sauce {saucePos} \u00B7 {cheeseType} ({cheesePos}) \u00B7 {note}",
    bakeNerd:
      "Cuisson id\u00E9ale\u00A0: {idealSec}s (plage {minM}\u2013{maxM} min) \u00B7 {turns} rotations \u00B7 {note}",
    mixerPlanetaria: "Robot p\u00E2tissier recommand\u00E9",
    mixerHand: "P\u00E9trissage \u00E0 la main possible",
    turnsSingle: "Tourner {n} fois pour une cuisson uniforme.",
    turnsNone: "Ne pas tourner pendant la cuisson.",
  },
  styleDescriptions: {
    napoletana_stg:
      "\u00C9talon d\u2019or selon le cahier des charges AVPN. Corniche gonfl\u00E9e, centre fin, cro\u00FBte l\u00E9opard.",
    napoletana_canotto:
      "Corniche explosive \u00AB canotto d\u2019air \u00BB, alv\u00E9olage extr\u00EAme, haute digestibilit\u00E9.",
    teglia_romana:
      "Haute hydratation, sans p\u00E9trissage avec pliages. Base croustillante, mie nuage.",
    tonda_romana:
      "Ultra-fine, rouleau obligatoire, croustillance extr\u00EAme. \u00AB Scrocchiarella \u00BB.",
    pinsa_romana:
      "M\u00E9lange 70% bl\u00E9 / 15% soja / 15% riz. Forme ovale, cro\u00FBte vitr\u00E9e.",
    pala_romana:
      "Format ovale allong\u00E9 servi sur pelle. Mi-chemin entre ronde et plaque\u00A0: croustillant dehors, nuage dedans.",
    new_york:
      "Grande part pliable, cro\u00FBte croustillante mais souple. Street food.",
    detroit:
      "Couronne de fromage croustillante, moule Blue Steel. Fromage jusqu\u2019aux bords.",
    chicago_deep:
      "Pizza profonde comme une tourte sal\u00E9e. Couches invers\u00E9es\u00A0: fromage-garniture-sauce.",
    bonci_teglia:
      "Sans p\u00E9trissage avec pliages, hydratation extr\u00EAme, maestro Bonci. Haute digestibilit\u00E9.",
    focaccia_genovese:
      "Moelleuse et huil\u00E9e, cro\u00FBte dor\u00E9e et crat\u00E8res caract\u00E9ristiques. Saumure huile-eau en surface.",
    sfincione:
      "Pizza \u00E9paisse sicilienne avec tomate, oignon, anchois, caciocavallo et chapelure. Street food de Palerme.",
    grandma_style:
      "Fine, croustillante, plaque huil\u00E9e. La pizza de la grand-m\u00E8re italo-am\u00E9ricaine. Mozzarella dessous, sauce dessus.",
    focaccia_recco:
      "Deux feuilles ultra-fines avec stracchino fondu. IGP depuis 2015. Bulles dor\u00E9es caract\u00E9ristiques.",
    padellino_torino:
      "Cuite en po\u00EAle de fonte, finie au four. Fond croustillant beurre-huile, moelleuse au centre. Sp\u00E9cialit\u00E9 turinoise.",
  },
  styleChars: {
    napoletana_stg:
      "Corniche 1-2cm gonfl\u00E9e|Centre 3-4mm fin|Cro\u00FBte l\u00E9opard|Cuisson 60-90s",
    napoletana_canotto:
      "Corniche 3-4cm \u00AB canotto \u00BB|Alv\u00E9olage extr\u00EAme|Maturation 24-72h|Haute digestibilit\u00E9",
    teglia_romana:
      "Hauteur 2-3cm|Hydratation 80-100%|Sans p\u00E9trissage + pliages|Mie nuage",
    tonda_romana:
      "\u00C9paisseur 1-2mm|Rouleau obligatoire|Croustillance extr\u00EAme|Farine faible W<210",
    pinsa_romana:
      "Mix multi-c\u00E9r\u00E9ales|Forme ovale|Cro\u00FBte vitr\u00E9e|Maturation 24-72h",
    pala_romana:
      "Forme ovale allong\u00E9e|Haute hydratation|Servie sur pelle|Cro\u00FBte croustillante-nuage",
    new_york:
      "Part pliable|Sucre + huile|Cuisson 12-15min|Onctuosit\u00E9 caract\u00E9ristique",
    detroit:
      "Couronne de fromage|Moule profond|Fromage aux bords|Cro\u00FBte caram\u00E9lis\u00E9e",
    chicago_deep:
      "Profondeur 5cm|Beurre 18%|Couches invers\u00E9es|Cuisson 35min",
    bonci_teglia:
      "Sans p\u00E9trissage + pliages|Hydratation extr\u00EAme|Maturation 24-72h|Alv\u00E9olage nuage",
    focaccia_genovese:
      "Huile d\u2019olive g\u00E9n\u00E9reuse|Crat\u00E8res de surface|Saumure huile-eau|Cuisson 15-20min",
    sfincione:
      "\u00C9pais et moelleux|Chapelure grill\u00E9e|Oignon + anchois|Caciocavallo",
    grandma_style:
      "Fine et croustillante|Mozzarella sous sauce|Plaque bien huil\u00E9e|Cuisson 12-16min",
    focaccia_recco:
      "Feuille quasi transparente|Fourr\u00E9e au stracchino|Bulles dor\u00E9es|Aucune levure",
    padellino_torino:
      "Po\u00EAle en fonte|Fond ultra-croustillant|Moelleuse au centre|Portion individuelle",
  },
  deviationLabels: {
    canonical: "Canonique",
    parameter_variant: "Variation param\u00E9trique",
    technique_variant: "Variante technique",
    hybrid: "Hybridation",
    experimental: "Exp\u00E9rimental",
  },
  authorNames: {
    bonci_no_knead: "No-Knead Haute Hydratation",
    martucci_biga_ibrida: "Biga Hybride 50% + Autolyse",
    martucci_biga_100: "Biga 100% avec Rafra\u00EEchi",
    pepe_sensoriale: "Hydratation Sensorielle",
    bosco_idrolisi:
      "M\u00E9thode Hydrolyse (Fermentation Spontan\u00E9e)",
    capuano_forbici: "M\u00E9thode Ciseaux (Produits laitiers)",
    pepe_sensory_layering: "Cuisson Séparée des Ingrédients",
    bianco_long_ferment: "Fermentation 5 Jours",
    forkish_saturday: "Pizza du Samedi (Fermentation à Froid)",
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
    pageTitle: "Votre Profil",
    pageSubtitle: "Vos préférences, toujours à portée de main.",
    ovenTitle: "Votre four",
    ovenSubtitle:
      "Détermine les températures et styles disponibles",
    ovenStep: "01 — Équipement",
    tempLabel: "Température maximale",
    tempAria: "Température maximale du four",
    skillTitle: "Votre expérience",
    skillSubtitle: "Nous adaptons la complexité des recettes",
    skillStep: "02 — Niveau",
    pantryTitle: "Votre garde-manger",
    pantrySubtitle:
      "Farines et levures que vous avez chez vous",
    pantryStep: "03 — Ingrédients",
    dietTitle: "Préférences alimentaires",
    dietSubtitle:
      "Filtrez les styles et ingrédients incompatibles",
    dietStep: "04 — Régime",
    noDietNote:
      "Aucune restriction — tous les styles disponibles.",
    prefsTitle: "Langue et thème",
    prefsSubtitle: "Personnalisez l'interface",
    prefsStep: "05 — Préférences",
    langLabel: "Langue",
    themeLabel: "Thème",
    themeLight: "Clair",
    themeDark: "Sombre",
    resetProfile: "Reconfigurer le profil",
    devModeOn: "Mode développeur actif",
    devModeOff: "Activer le mode développeur",
    ftuWelcome: "Bienvenue",
    ftuOvenTitle: "Quel four avez-vous ?",
    ftuOvenSubtitle: "Le four définit les styles possibles",
    ftuSkillTitle: "Quelle expérience ?",
    ftuSkillSubtitle: "Nous vous guiderons au bon niveau",
    ftuPantryTitle: "Qu'avez-vous dans votre garde-manger ?",
    ftuPantrySubtitle: "Farines et levures disponibles",
    ftuBack: "Retour",
    ftuNext: "Suivant",
    ftuStart: "C'est parti",
    localeModalTitle: "Changer de langue ?",
    localeModalDesc:
      "Tous les textes de l'interface passeront de {from} à {to}.",
    localeModalCancel: "Annuler",
    localeModalConfirm: "Confirmer",
    flour00: "Type 00",
    flour0: "Type 0",
    flourManitoba: "Manitoba",
    flourIntegrale: "Compl\u00E8te",
    flourSemola: "Semoule remoulue",
    yeastFresh: "Levure fra\u00EEche",
    yeastDry: "Levure s\u00E8che",
    yeastSourdough: "Levain",
    dietGlutenFree: "Sans gluten",
    dietLactoseFree: "Sans lactose",
    dietVegan: "V\u00E9gan",
    dietLowFodmap: "Low FODMAP",
    dietHistamine: "Faible histamine",
    dietNickel: "Faible nickel",
    equipTitle: "Équipement",
    equipSubtitle: "Ce que vous avez en cuisine",
    equipStep: "03 — Équipement",
    equipMixerTitle: "Pétrissage",
    equipSurfaceTitle: "Surface de cuisson",
    equipToolsTitle: "Ustensiles",
    equipSummaryNone: "Non sélectionné",
    equipSummarySelected: "{count} sélectionnés",
    mixerHands: "À la main",
    mixerHandsDesc: "Pétrissage manuel, sans équipement",
    mixerStandDomestic: "Robot pâtissier (domestique)",
    mixerStandDomesticDesc:
      "KitchenAid, Kenwood, Smeg — 4-7 L, crochet",
    mixerPlanetary: "Pétrin planétaire (semi-pro)",
    mixerPlanetaryDesc:
      "10-20 L, crochet spirale, moteur 500W+",
    mixerSpiral: "Pétrin à spirale",
    mixerSpiralDesc: "Cuve fixe/basculante, professionnel",
    mixerFork: "Pétrin à fourche",
    mixerForkDesc:
      "Lent, faible friction — idéal pour haute hydratation",
    mixerLevelHome: "Maison",
    mixerLevelSemiPro: "Semi-Pro",
    mixerLevelPro: "Pro",
    surfaceRefractory: "Brique réfractaire",
    surfaceRefractoryDesc:
      "3 cm, haute masse thermique — four à bois et prosumer",
    surfaceCordierite: "Pierre en cordiérite",
    surfaceCordieriteDesc:
      "1.5 cm, compromis masse/vitesse — Effeuno, Ooni",
    surfaceSteel: "Plaque en acier",
    surfaceSteelDesc:
      "5-10 mm, transfert ultra-rapide — fond croustillant en secondes",
    surfaceAluminum: "Plaque en aluminium",
    surfaceAluminumDesc:
      "Légère, conductivité extrême — Detroit, teglia romaine",
    surfaceBlueSteel: "Plaque en acier bleu",
    surfaceBlueSteelDesc:
      "Anti-adhérent naturel, bord haut — teglia, focaccia",
    surfaceCastIron: "Poêle en fonte",
    surfaceCastIronDesc:
      "Haute masse thermique, bord haut — Chicago, padellino",
    surfaceOvenRack: "Grille du four",
    surfaceOvenRackDesc:
      "Pas de surface supplémentaire — grille standard uniquement",
    toolCatEssential: "Essentiels",
    toolCatPrecision: "Précision",
    toolCatHandling: "Manipulation",
    toolCatContainment: "Stockage",
    toolDigitalScale: "Balance digitale",
    toolDigitalScaleDesc: "Précision 1g, capacité 5kg+",
    toolThermometer: "Thermomètre",
    toolThermometerDesc: "IR ou sonde, pour pâte et four",
    toolScraper: "Coupe-pâte",
    toolScraperDesc: "Plastique souple pour pliages et découpe",
    toolContainers: "Bacs de fermentation",
    toolContainersDesc: "Empilables ou bols avec couvercle",
    toolDoughCutter: "Coupe-pâte inox",
    toolDoughCutterDesc:
      "Acier inox, pour portionner avec précision",
    toolBenchKnife: "Spatule de plan",
    toolBenchKnifeDesc:
      "Acier inox, pour retourner les pâtes très hydratées",
    toolScoringBlade: "Lame de scoring",
    toolScoringBladeDesc:
      "Pour les incisions décoratives en surface",
    toolPeelWood: "Pelle en bois",
    toolPeelWoodDesc:
      "Pour enfourner — faible friction avec la semoule",
    toolPeelMetal: "Pelle en aluminium",
    toolPeelMetalDesc:
      "Pour tourner et défourner — fine et réactive",
    toolPizzaScreen: "Grille perforée",
    toolPizzaScreenDesc:
      "Aluminium perforé pour cuisson croustillante",
    toolProofingBoxes: "Bacs à levée",
    toolProofingBoxesDesc:
      "Empilables avec couvercle — 30×40 ou 40×60 cm",
    toolBannetons: "Bannetons",
    toolBannetonsDesc: "Pour formes rondes, avec toile en lin",
  },
  pages: {
    navCreate: "Cr\u00E9er",
    navExplore: "Styles",
    navLearn: "Apprendre",
    navProfile: "Profil",
    navSearch: "Rechercher",
    exploreStepNum: "15 styles \u2014 4 familles",
    exploreTitle: "Explorer les Styles",
    exploreSubtitle:
      "De la Napoletana STG \u00E0 la Focaccia di Recco.",
    learnTitle: "Apprendre",
    learnSubtitle:
      "La science et l'art de la pizza, bien expliqu\u00E9s.",
    learnGlossary: "Glossaire",
    learnGlossaryDesc: "30+ termes techniques de boulangerie",
    learnTroubleshooting: "Probl\u00E8mes & Solutions",
    learnTroubleshootingDesc:
      "20 probl\u00E8mes courants et comment les r\u00E9soudre",
    learnPreFerments: "Pr\u00E9-ferments",
    learnPreFermentsDesc: "Guide Biga, Poolish et Autolyse",
    recipeLabel: "Recette",
    recipeBackToStyles: "Styles",
    recipeStyleNotFound: "Style introuvable",
    recipeStyleNotFoundDesc:
      "Le style \u00AB {id} \u00BB n'existe pas dans la base de donn\u00E9es.",
    recipeExploreStyles: "Explorer les styles",
    recipeCopyLinkAria: "Copier le lien de la recette",
    notFoundTitle: "Page introuvable",
    notFoundSubtitle:
      "Cette pizza n'existe pas dans notre menu.",
    notFoundBack: "Retour \u00E0 l'accueil",
    searchPlaceholder:
      "Rechercher style, farine, terme, probl\u00E8me\u2026",
    searchCatStyles: "Styles",
    searchCatFlours: "Farines",
    searchCatGlossary: "Glossaire",
    searchCatProblems: "Probl\u00E8mes",
    searchCatGuides: "Guides",
    searchNoResults:
      "Aucun r\u00E9sultat pour \u00AB {query} \u00BB",
    searchHint:
      "Tapez pour rechercher styles, farines, glossaire et probl\u00E8mes",
    searchSuggestions: "Suggestions",
    searchFlourWheat: "Bl\u00E9 tendre",
    searchFlourManitoba: "Manitoba",
    searchFlourSemola: "Semoule",
    searchFlourWholegrain: "Compl\u00E8te",
    searchFlourGlutenFree: "Sans gluten",
    searchFlourSpecial: "Sp\u00E9ciale",
    skipToContent: "Aller au contenu",
    navMainLabel: "Navigation principale",
    searchCloseLabel: "Fermer la recherche",
    searchFieldLabel: "Champ de recherche global",
    searchClearLabel: "Effacer la recherche",
    dietaryWarningsTitle:
      "Avertissements di\u00E9t\u00E9tiques",
    troubleshootingTitle:
      "Probl\u00E8mes avec la recette\u00A0?",
    troubleshootingDesc:
      "Consultez le guide de 20 probl\u00E8mes courants et solutions",
  },
  configurator: {
    hydrationLabel: "Hydratation",
    hydrationTip:
      "Pourcentage d'eau par rapport \u00E0 la farine. Plus \u00E9lev\u00E9 = p\u00E2te plus souple et mie ouverte, mais plus difficile \u00E0 travailler.",
    flourWLabel: "Force Farine (W)",
    flourWTip:
      "Mesure la capacit\u00E9 \u00E0 absorber l'eau et retenir le gaz. W plus \u00E9lev\u00E9 = fermentations plus longues et structure plus forte.",
    plLabel: "Rapport P/L",
    plTip:
      "Rapport alv\u00E9ographique t\u00E9nacit\u00E9/extensibilit\u00E9. P/L bas = p\u00E2te extensible (pizza ronde). P/L \u00E9lev\u00E9 = p\u00E2te tenace (longue fermentation). Estim\u00E9 \u00E0 partir du W si non modifi\u00E9.",
    fermentLabel: "Fermentation",
    fermentTip:
      "Dur\u00E9e totale de fermentation. Plus d'heures \u00E0 basse temp\u00E9rature = saveur plus complexe et meilleure digestibilit\u00E9.",
    tempFridge: "4\u00B0C frigo",
    tempCool: "12\u00B0C",
    tempAmbient: "22\u00B0C amb.",
    preFermentLabel: "Pr\u00E9-ferment",
    preFermentTip:
      "Le pr\u00E9-ferment (biga, poolish) est une portion de p\u00E2te ferment\u00E9e \u00E0 l'avance. Am\u00E9liore la saveur, la digestibilit\u00E9 et la conservation. N\u00E9cessite 12\u201324 h de planification suppl\u00E9mentaire.",
    ovenLabel: "Four",
    ovenTip:
      "S\u00E9lectionnez le type et r\u00E9glez la temp\u00E9rature. Temp\u00E9ratures plus \u00E9lev\u00E9es = cuisson plus rapide et meilleure cro\u00FBte.",
    panLabel: "Plaque",
    panTipRect:
      "La forme et la taille de la plaque affectent la quantit\u00E9 de p\u00E2te et le r\u00E9sultat final. Le standard pour ce style est rectangulaire.",
    panTipRound:
      "La forme et la taille de la plaque affectent la quantit\u00E9 de p\u00E2te et le r\u00E9sultat final. Le standard pour ce style est ronde.",
    panRectangular: "Rectangulaire",
    panRound: "Ronde",
    panLength: "Longueur",
    panWidth: "Largeur",
    panDiameter: "Diam\u00E8tre",
    panArea: "Surface plaque",
    thicknessLabel: "\u00C9paisseur",
    thicknessTip:
      "L'\u00E9paisseur de la pizza affecte directement le poids du p\u00E2ton, la cuisson et la texture finale. Valeurs basses = fine et croustillante. Valeurs hautes = moelleuse et \u00E9paisse.",
    thicknessThin: "Fine et croustillante",
    thicknessThick: "\u00C9paisse et moelleuse",
    thicknessStandard: "Standard pour ce style",
    backLabel: "Retour",
    sliderOptimal: "optimal",
  },
  preFerment: PRE_FERMENT_FR as any,
  dietaryI18n: DIETARY_FR as any,
  troubleshootingI18n: TROUBLESHOOTING_FR as any,
  glossaryTerms: GLOSSARY_TERMS_FR as any,
};