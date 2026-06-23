/* === DOMAIN DATA i18n — Français === */
import type {
  CmsPreFerment,
  CmsDietaryI18n,
  CmsTroubleshootingI18n,
  CmsGlossaryTerms,
} from "../cms-context";

export const PRE_FERMENT_FR: Partial<CmsPreFerment> = {
  sectionLabel: "Pr\u00E9-ferment",
  tipsLabel: "Conseils",
  showComparison: "Comparer Biga vs Poolish vs Autolyse",
  hideComparison: "Masquer la comparaison",
  paramHydration: "Hydratation",
  paramDuration: "Dur\u00E9e",
  paramTemperature: "Temp\u00E9rature",
  paramPh: "pH final",
  detailFermentation: "Fermentation",
  detailFlavor: "Saveur",
  detailCrust: "Cro\u00FBte",
  detailExtensibility: "Extensibilit\u00E9",
  detailIdealStyles: "Styles id\u00E9aux",
  compLabels: [
    "Hydratation",
    "Levure",
    "Dur\u00E9e",
    "Temp\u00E9rature",
    "pH final",
    "Saveur",
    "Extensibilit\u00E9",
    "Alv\u00E9olage",
    "Complexit\u00E9",
  ],
  items: {
    poolish: {
      origin: "Fran\u00E7ais",
      description:
        "Pr\u00E9-ferment liquide (1:1 farine:eau) avec fermentation principalement alcoolique. D\u00E9veloppe les sucres pour une Maillard intense.",
      hydration: "100% (ratio 1:1)",
      consistency: "Liquide, mousseux",
      fermentationType:
        "Principalement alcoolique (CO\u2082 + \u00E9thanol)",
      flavor: "Doux, malt\u00E9, notes complexes",
      crustResult:
        "L\u00E9g\u00E8re, dor\u00E9e intense, leopard spotting marqu\u00E9",
      extensibility:
        "\u00C9lev\u00E9e \u2014 \u00E9tirage facile",
      idealStyles:
        "Teglia Romana, NY Style, Napolitaine contemporaine, Focaccia",
      tips: [
        "Point optimal : surface en d\u00F4me avec bulles, commence \u00E0 se r\u00E9tracter",
        "Au-del\u00E0 de 16h la saveur devient trop acide/alcoolique",
        "S'il s'effondre, encore utilisable mais r\u00E9duire le pourcentage du total",
        "Pourcentage de poolish : 20-40% de la farine totale",
      ],
    },
    biga: {
      origin: "Italien",
      description:
        "Pr\u00E9-ferment sec (44-48% hydratation) avec fermentation lactique + alcoolique. Conservation maximale et complexit\u00E9 aromatique.",
      hydration: "44-48%",
      consistency: "S\u00E8che, compacte",
      fermentationType: "Lactique + alcoolique (LAB actifs)",
      flavor: "Acidul\u00E9, complexe, notes ferment\u00E9es",
      crustResult: "Croustillante, friable, alv\u00E9olage fin",
      extensibility:
        "Faible \u2014 n\u00E9cessite repos apr\u00E8s boulage",
      idealStyles:
        "Napolitaine classique, Pinsa, Pizza al taglio, Pain",
      tips: [
        "Si trop s\u00E8che : ajouter 5-10% d'eau",
        "M\u00FBre quand la surface est craquel\u00E9e et le volume a tripl\u00E9",
        "Conservable 48h au frigo (rafra\u00EEchir avec 10% d'eau avant usage)",
        "Pourcentage de biga : 20-50% de la farine totale",
      ],
    },
    autolisi: {
      origin: "Universel",
      description:
        "Repos enzymatique de farine+eau seules (sans levure ni sel). D\u00E9veloppe le gluten spontan\u00E9ment et active prot\u00E9ases/amylases.",
      hydration: "55-75% (toute l'eau de la recette)",
      consistency: "P\u00E2teuse",
      fermentationType:
        "Aucune (activit\u00E9 enzymatique uniquement)",
      flavor: "Neutre \u2014 n'alt\u00E8re pas la saveur",
      crustResult:
        "Variable \u2014 d\u00E9pend du processus suivant",
      extensibility:
        "\u00C9lev\u00E9e \u2014 p\u00E2te soyeuse et moins collante",
      idealStyles: "Tous les styles (technique universelle)",
      tips: [
        "Farines compl\u00E8tes : autolyse plus longue (60-90min)",
        "Eau ti\u00E8de (30-35\u00B0C) acc\u00E9l\u00E8re les enzymes",
        "TOUJOURS avant d'ajouter le sel (le sel inhibe les enzymes)",
        "R\u00E9duit le temps de p\u00E9trissage de 30%",
        "Combinable avec Biga ou Poolish",
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
      autolisi: "Ambiante",
    },
    ph: {
      biga: "5.0-5.3",
      poolish: "4.5-4.8",
      autolisi: "~6.5",
    },
    flavor: {
      biga: "Acidul\u00E9",
      poolish: "Doux/malt\u00E9",
      autolisi: "Neutre",
    },
    extensibility: {
      biga: "Faible",
      poolish: "\u00C9lev\u00E9e",
      autolisi: "\u00C9lev\u00E9e",
    },
    alveolatura: {
      biga: "Fin",
      poolish: "Large",
      autolisi: "Large",
    },
    complexity: {
      biga: "Moyenne",
      poolish: "Faible",
      autolisi: "Tr\u00E8s faible",
    },
  },
};

export const DIETARY_FR: Partial<CmsDietaryI18n> = {
  info: {
    low_fodmap: {
      name: "Low FODMAP",
      description:
        "R\u00E9duit les fructanes et oligosaccharides fermentescibles",
      scienceNote:
        "Fermentation \u226524h r\u00E9duit FODMAP 70% (Costabile 2014)",
    },
    histamine: {
      name: "Faible histamine",
      description:
        "Limite l'accumulation d'histamine par fermentation longue",
      scienceNote:
        "L'histamine s'accumule lin\u00E9airement. Levure fra\u00EEche <6h : s\u00FBr (<5 mg/kg)",
    },
    gluten_free: {
      name: "Sans gluten",
      description:
        "Pour maladie c\u0153liaque ou sensibilit\u00E9 au gluten",
      scienceNote:
        "Seuil UE : <20 ppm. N\u00E9cessite mix GF (riz/ma\u00EFs/quinoa + xanthane 1.5%)",
    },
    lactose_free: {
      name: "Sans lactose",
      description: "Pour intol\u00E9rance au lactose",
      scienceNote:
        "Cuisson >200\u00B0C d\u00E9grade 90%+ du lactose. Seul S\u00C9V\u00C8RE n\u00E9cessite substitution",
    },
    nickel: {
      name: "Faible nickel",
      description:
        "Pour allergie syst\u00E9mique au nickel (SNAS)",
      scienceNote:
        "Farine 00 (~50 \u00B5g/100g) vs compl\u00E8te (~200 \u00B5g/100g). Seuil <200 \u00B5g/jour",
    },
    vegan: {
      name: "V\u00E9gan",
      description: "Aucun d\u00E9riv\u00E9 animal",
      scienceNote:
        "La p\u00E2te de base est d\u00E9j\u00E0 v\u00E9gane. Attention aux garnitures et graisses (beurre \u2192 huile)",
    },
  },
  conflicts: {
    fodmap_histamine: {
      message:
        "FODMAP n\u00E9cessite fermentation longue (\u226524h), histamine n\u00E9cessite fermentation courte (\u226412h)",
      compromiseTip:
        "Compromis : 8-12h avec levure fra\u00EEche \u00E0 18\u00B0C. FODMAP r\u00E9duits ~40% (sous-optimal), histamine ~8 mg/kg (acceptable)",
    },
    gf_fodmap: {
      message:
        "Compatibles ! Le mix GF \u00E9limine la source principale de FODMAP (fructanes du bl\u00E9)",
    },
    nickel_general: {
      message:
        "Pour faible nickel pr\u00E9f\u00E9rer farine 00 (50 \u00B5g/100g) \u00E0 la compl\u00E8te (200 \u00B5g/100g)",
    },
  },
  warnings: {
    fodmap_low: {
      message:
        "FODMAP r\u00E9duits seulement {pct}% \u2014 fermentation trop courte",
      tip: "Augmenter \u00E0 \u226524h pour atteindre 70%+ de r\u00E9duction",
    },
    fodmap_good: {
      message:
        "FODMAP r\u00E9duits {pct}% \u2014 bon niveau pour le SII",
      tip: "La fermentation est suffisamment longue pour d\u00E9grader les fructanes",
    },
    histamine_high: {
      message:
        "Histamine estim\u00E9e ~{val} mg/kg \u2014 niveau \u00E9lev\u00E9",
      tip: "R\u00E9duire la fermentation \u00E0 \u226412h ou utiliser levure fra\u00EEche \u00E0 \u226420\u00B0C",
    },
    histamine_moderate: {
      message:
        "Histamine estim\u00E9e ~{val} mg/kg \u2014 niveau mod\u00E9r\u00E9",
      tip: "Surveiller les sympt\u00F4mes. Par s\u00E9curit\u00E9 r\u00E9duire temps ou temp\u00E9rature",
    },
    gluten_free: {
      message:
        "La recette utilise de la farine de bl\u00E9 \u2014 incompatible avec la maladie c\u0153liaque",
      tip: "Remplacer par mix GF (riz 40% + ma\u00EFs 30% + quinoa 10% + sorgho 10% + amidon 10%) + xanthane 1.5%",
    },
    nickel_highW: {
      message:
        "Les farines fortes (W \u00E9lev\u00E9) sont moins raffin\u00E9es, avec plus de nickel",
      tip: "Pr\u00E9f\u00E9rer farine 00 raffin\u00E9e (W 200-260) pour minimiser le nickel",
    },
  },
};

export const TROUBLESHOOTING_FR: Partial<CmsTroubleshootingI18n> =
  {
    categories: {
      dough: "P\u00E2te",
      fermentation: "Fermentation",
      shaping: "\u00C9talage",
      baking: "Cuisson",
      solver: "Algorithme",
      false_positive: "Fausses alertes",
    },
    issues: {
      P01: {
        symptom: "P\u00E2te collante persistante",
        cause:
          "Hydratation sup\u00E9rieure \u00E0 la capacit\u00E9 d'absorption de la farine",
        testRapido:
          "Comparer H% recette vs absorption farine (+5% max)",
        fixImmediate:
          "Ajouter 2-3% de farine, incorporer avec des plis d\u00E9licats",
        prevention: "Utiliser H% \u2264 absorption farine + 5%",
      },
      P02: {
        symptom:
          "La p\u00E2te se d\u00E9chire pendant l'\u00E9tirage",
        cause:
          "P/L trop \u00E9lev\u00E9 (>0.8) ou fermentation insuffisante (<6h)",
        testRapido:
          "\u00C9tirer le p\u00E2ton de 10cm : se d\u00E9chire-t-il ?",
        fixImmediate:
          "Repos 60min couvert \u00E0 temp\u00E9rature ambiante",
        prevention:
          "Choisir farines avec P/L 0.5-0.6, fermentation minimum 8h",
      },
      P03: {
        symptom: "La p\u00E2te s'affaisse quand on la touche",
        cause:
          "Sur-ferment\u00E9e (volume >150%, empreinte du doigt ne revient pas)",
        testRapido:
          "Appuyer 1cm avec le doigt : revient en 3-5s ?",
        fixImmediate:
          "Irr\u00E9versible. \u00C9taler d\u00E9licatement et cuire imm\u00E9diatement",
        prevention:
          "Contr\u00F4ler le volume toutes les 6h, max +150% d'augmentation",
      },
      P04: {
        symptom: "Aucune lev\u00E9e apr\u00E8s 6+ heures",
        cause:
          "Levure morte, temp\u00E9rature trop basse, ou sel en contact direct",
        testRapido:
          "Test de vitalit\u00E9 : 5g levure + 5g sucre dans 100ml eau 35\u00B0C \u2014 mousse apr\u00E8s 15min ?",
        fixImmediate:
          "Ajouter 0.3% levure fra\u00EEche dissoute dans eau ti\u00E8de, incorporer avec plis",
        prevention: "Tester la levure avant chaque utilisation",
      },
      P05: {
        symptom: "Lev\u00E9e trop rapide (doubl\u00E9 en <3h)",
        cause:
          "Trop de levure (>1.5%) ou temp\u00E9rature ambiante >28\u00B0C",
        testRapido:
          "La p\u00E2te a doubl\u00E9 en moins de 3 heures ?",
        fixImmediate:
          "Transf\u00E9rer imm\u00E9diatement \u00E0 4\u00B0C pour bloquer la fermentation",
        prevention:
          "Utiliser 0.2% levure fra\u00EEche pour 24h, contr\u00F4ler temp\u00E9rature",
      },
      P06: {
        symptom: "Saveur trop acide/ac\u00E9tique",
        cause:
          "LAB h\u00E9t\u00E9rofermentatifs actifs >48h \u00E0 >18\u00B0C (surtout avec levain)",
        testRapido:
          "pH p\u00E2te \u2014 devrait \u00EAtre 4.5-5.5, probl\u00E9matique si <4.2",
        fixImmediate:
          "Ajouter 0.5-1% sucre pour masquer l'acidit\u00E9",
        prevention:
          "Fermentations >24h toujours \u00E0 4-8\u00B0C",
      },
      P07: {
        symptom:
          "Le p\u00E2ton revient \u00E9lastique apr\u00E8s \u00E9tirage ('effet ressort')",
        cause: "Gluten pas suffisamment relax\u00E9",
        testRapido:
          "\u00C9taler \u00E0 30cm \u2014 revient \u00E0 25cm apr\u00E8s 30 secondes ?",
        fixImmediate:
          "Repos suppl\u00E9mentaire 15min couvert, \u00E9tirage en 2 phases",
        prevention:
          "Sortir les p\u00E2tons du frigo 60-90min avant l'\u00E9tirage",
      },
      P08: {
        symptom:
          "Trous g\u00E9ants irr\u00E9guliers dans la pizza",
        cause:
          "D\u00E9gazage insuffisant + \u00E9tirage trop d\u00E9licat",
        testRapido:
          "Alv\u00E9oles >3cm et distribution in\u00E9gale ?",
        fixImmediate:
          "Presser l\u00E9g\u00E8rement le p\u00E2ton pour redistribuer le gaz",
        prevention:
          "R\u00E9duire le temps de fermentation de 20%",
      },
      P09: {
        symptom: "Base crue mais corniche br\u00FBl\u00E9e",
        cause:
          "D\u00E9s\u00E9quilibre thermique : trop de chaleur du haut, pas assez du bas",
        testRapido:
          "Contraste de couleur extr\u00EAme entre le dessus et le dessous ?",
        fixImmediate:
          "Pr\u00E9-cuisson de la base 3min sans garniture",
        prevention:
          "Utiliser plaque/pierre plus \u00E9paisse, \u00E9quilibrer chaleur haut/bas",
      },
      P10: {
        symptom: "Cro\u00FBte p\u00E2le, pas de dorure",
        cause:
          "Temp\u00E9rature <250\u00B0C, sucres \u00E9puis\u00E9s, ou humidit\u00E9 excessive en surface",
        testRapido:
          "Le four atteint-il au moins 250\u00B0C ? Fermentation >48h ?",
        fixImmediate:
          "Badigeonner huile+miel avant cuisson ou grill final 2min",
        prevention:
          "Ajouter 0.5-1% sucre, four au moins 280\u00B0C",
      },
      P11: {
        symptom: "Pizza caoutchouteuse, pas croustillante",
        cause:
          "Temp\u00E9rature \u00E0 c\u0153ur <85\u00B0C, hydratation >70%, ou cuisson trop lente",
        testRapido:
          "Thermom\u00E8tre \u00E0 c\u0153ur : atteint 90\u00B0C+ ?",
        fixImmediate:
          "Prolonger cuisson +2min ou augmenter temp\u00E9rature +20\u00B0C",
        prevention:
          "H \u2264 65%, temp\u00E9rature \u00E0 c\u0153ur cible 95\u00B0C",
      },
      P14: {
        symptom: "Taches l\u00E9opard sur la corniche",
        cause:
          "Contact avec vo\u00FBte du four >500\u00B0C \u2014 r\u00E9action de Maillard localis\u00E9e",
        testRapido: "Les taches ont-elles un go\u00FBt amer ?",
        fixImmediate:
          "PAS un probl\u00E8me ! C'est la caract\u00E9ristique recherch\u00E9e de la pizza napolitaine",
        prevention:
          "Si trop marqu\u00E9es : tourner la pizza toutes les 20s",
      },
      P15: {
        symptom: "Fond de pizza sombre/noir",
        cause: "Pierre ou plaque trop chaude (>450\u00B0C)",
        testRapido: "Go\u00FBter : saveur am\u00E8re ?",
        fixImmediate:
          "Si amer = probl\u00E8me (baisser temp). Si savoureux = NORMAL",
        prevention:
          "Pr\u00E9chauffage de la pierre contr\u00F4l\u00E9, pas au-del\u00E0 de 400\u00B0C",
      },
      P16: {
        symptom: "Corniche basse et plate",
        cause:
          "D\u00E9gazage excessif, W farine trop bas, ou rouleau utilis\u00E9",
        testRapido: "Hauteur corniche <1cm ?",
        fixImmediate:
          "\u00C9tirage plus d\u00E9licat, ne pas \u00E9craser les bords",
        prevention:
          "W \u2265 240 pour napolitaine, jamais de rouleau sur styles avec corniche",
      },
      P17: {
        symptom: "Pizza trop s\u00E8che",
        cause:
          "Hydratation <55% ou cuisson trop longue (>10min)",
        testRapido:
          "H% de la recette ? Temps de cuisson effectif ?",
        fixImmediate:
          "Ajouter de l'huile abondante sur la garniture",
        prevention:
          "H \u2265 58%, ne pas d\u00E9passer le temps de cuisson recommand\u00E9",
      },
      P18: {
        symptom: "Centre de la pizza aqueux",
        cause: "Garniture trop liquide ou cuisson trop courte",
        testRapido:
          "Quantit\u00E9 de sauce par pizza ? Mozzarella tr\u00E8s humide ?",
        fixImmediate:
          "Pr\u00E9-cuisson base 2min, puis ajouter garniture",
        prevention:
          "Max 80ml sauce par pizza 30cm, bien \u00E9goutter la mozzarella",
      },
      P19: {
        symptom: "Impossible d'\u00E9taler le p\u00E2ton",
        cause:
          "Farine Manitoba pure (W >380), p\u00E2te trop tenace",
        testRapido:
          "Quelle farine avez-vous utilis\u00E9e ? W >350 ?",
        fixImmediate:
          "M\u00E9lange 50:50 avec farine W 200 pour la prochaine fois",
        prevention:
          "Max W 320 pour pizza, farines avec P/L 0.5-0.6",
      },
      P20: {
        symptom: "Odeur 'chimique' dans la p\u00E2te",
        cause: "Eau du robinet \u00E0 fort taux de chlore",
        testRapido: "Forte odeur en ouvrant le robinet ?",
        fixImmediate:
          "Utiliser eau en bouteille pour le prochain p\u00E9trissage",
        prevention:
          "Filtrer l'eau ou la laisser reposer 12h ouverte (le chlore s'\u00E9vapore)",
      },
    },
    contextual: {
      sticky_dough: {
        message:
          "Hydratation {h}% avec W {w} : risque de p\u00E2te collante",
        tip: "Utiliser farine W \u2265 280 ou r\u00E9duire hydratation \u00E0 68-70%",
      },
      high_pl: {
        message:
          "P/L {pl} \u00E9lev\u00E9 : possible p\u00E2te trop tenace",
        tip: "Pr\u00E9voir autolyse 45min avant sel et levure",
      },
      sour_risk: {
        message:
          "{h}h \u00E0 {t}\u00B0C : risque de saveur acide",
        tip: "Pour fermentations >24h, utiliser temp\u00E9rature 4-8\u00B0C",
      },
      pale_crust: {
        message:
          "Fermentation courte ({h}h) : cro\u00FBte p\u00E2le et digestibilit\u00E9 limit\u00E9e",
        tip: "Ajouter 0.5-1% sucre pour favoriser le brunissement Maillard",
      },
      cold_oven: {
        message:
          "Four \u00E0 {t}\u00B0C : risque de base crue avec bord br\u00FBl\u00E9",
        tip: "Pr\u00E9-cuire la base 3min sans garniture",
      },
      beginner_hydration: {
        message:
          "Hydratation {h}% est exigeante pour les d\u00E9butants",
        tip: "Commencer \u00E0 60-65% et augmenter progressivement",
      },
      high_w: {
        message:
          "W {w} tr\u00E8s \u00E9lev\u00E9 : p\u00E2te difficile \u00E0 \u00E9taler",
        tip: "M\u00E9langer 50:50 avec farine W 200 ou pr\u00E9voir autolyse longue",
      },
      flat_long_ferment: {
        message:
          "{h}h au frigo sans pr\u00E9-ferment : possible saveur plate",
        tip: "Ajouter un pr\u00E9-ferment (poolish ou biga) pour la complexit\u00E9 aromatique",
      },
    },
  };

export const GLOSSARY_TERMS_FR: Partial<CmsGlossaryTerms> = {
  terms: {},
};