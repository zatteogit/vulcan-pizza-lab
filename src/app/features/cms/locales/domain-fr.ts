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
      P21: {
        symptom: "La fermentation varie d'une pâte à l'autre (réfrigérateur domestique)",
        cause: "Un réfrigérateur domestique ne garde pas une température stable : dégivrages, ouvertures et étagères différentes font varier la maturation à froid, contrairement à une chambre froide professionnelle",
        testRapido: "Même style, même dose de levure : la pousse change-t-elle beaucoup d'une fois à l'autre ?",
        fixImmediate: "Placez la pâte sur l'étagère du bas ou du milieu (la plus stable) et jugez le pâton à l'œil, pas seulement à la montre",
        prevention: "Astuce de Bonci pour la maison : 0,5–1 % de sucre donne à la levure une nourriture immédiate et rend la fermentation plus prévisible quand le réfrigérateur est instable. Seulement pour les styles qui admettent des additifs — jamais pour la Napoletana STG/AVPN selon le cahier des charges",
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
  terms: {
    w_alveograph: {
      name: "W (Alv\u00E9ographe de Chopin)",
      definition: "\u00C9nergie totale n\u00E9cessaire pour gonfler une bulle de p\u00E2te jusqu'\u00E0 la rupture. Mesure la force globale de la farine.",
      whyImportant: "W bas (<180) : p\u00E2te extensible, fermentation courte. W moyen (220-280) : id\u00E9al pour la napolitaine, tol\u00E8re 18-30h. W \u00E9lev\u00E9 (>300) : p\u00E2te tenace, n\u00E9cessaire pour les p\u00E2tes enrichies.",
      ranges: [
        { label: "Faible", value: "90\u2013160", note: "Biscuits, gaufrettes" },
        { label: "Moyenne", value: "160\u2013200", note: "Pain de mie, focaccia" },
        { label: "Moyenne-forte", value: "200\u2013280", note: "Pizza napolitaine" },
        { label: "Forte", value: "280\u2013350", note: "Pains \u00E0 longue fermentation" },
        { label: "Tr\u00E8s forte", value: "350\u2013450", note: "Panettone, croissant" },
      ],
    },
    p_tenacity: {
      name: "P (T\u00E9nacit\u00E9)",
      definition: "R\u00E9sistance maximale \u00E0 la d\u00E9formation. Pic de la courbe alv\u00E9ographique \u2014 \u00E0 quel point la p\u00E2te r\u00E9siste \u00E0 l'\u00E9tirement.",
      whyImportant: "P \u00E9lev\u00E9 : p\u00E2te \u00AB dure \u00BB, garde sa forme \u00E0 la cuisson. P bas : p\u00E2te \u00AB molle \u00BB, facile \u00E0 \u00E9taler, peut s'affaisser.",
      ranges: [
        { label: "Pizza", value: "40\u201380 mm" },
        { label: "Pain", value: "80\u2013120 mm" },
        { label: "Croissant", value: "100\u2013140 mm" },
      ],
    },
    l_extensibility: {
      name: "L (Extensibilit\u00E9)",
      definition: "Longueur maximale atteinte par la bulle avant la rupture. Mesure jusqu'o\u00F9 la p\u00E2te peut s'allonger.",
      whyImportant: "L \u00E9lev\u00E9 : p\u00E2te extensible, facile \u00E0 \u00E9taler sans d\u00E9chirures. L bas : p\u00E2te courte, se d\u00E9chire.",
      ranges: [
        { label: "Pizza", value: "80\u2013120 mm" },
        { label: "Pain", value: "60\u2013100 mm" },
      ],
    },
    pl_ratio: {
      name: "P/L (Rapport T\u00E9nacit\u00E9/Extensibilit\u00E9)",
      definition: "Indice d'\u00E9quilibre m\u00E9canique. Rapport entre la r\u00E9sistance et l'extensibilit\u00E9 de la p\u00E2te.",
      whyImportant: "P/L optimal (0.5-0.6) : corniche haute + base fine. <0.4 : pizza plate. >0.8 : p\u00E2te \u00AB caoutchouteuse \u00BB.",
      ranges: [
        { label: "<0.4 Tr\u00E8s extensible", value: "S'affaisse facilement", note: "Pinsa" },
        { label: "0.4\u20130.5 Extensible", value: "Facile \u00E0 travailler", note: "Napolitaine classique" },
        { label: "0.5\u20130.7 \u00C9quilibr\u00E9", value: "Bon \u00E9quilibre", note: "Napolitaine moderne, pain" },
        { label: "0.7\u20131.0 Tenace", value: "R\u00E9sistante", note: "Pains \u00E0 longue fermentation" },
        { label: ">1.0 Tr\u00E8s tenace", value: "\u00C9lastique, se r\u00E9tracte", note: "Croissant" },
      ],
    },
    falling_number: {
      name: "Falling Number (Hagberg-Perten)",
      definition: "Temps mis par une tige pour descendre \u00E0 travers une suspension de farine chauff\u00E9e. Mesure l'activit\u00E9 amylasique.",
      whyImportant: "FN bas (<250) : fermentation rapide mais p\u00E2te instable. FN \u00E9lev\u00E9 (>300) : stable pour les longues maturations.",
      ranges: [
        { label: "<200 Amylase tr\u00E8s \u00E9lev\u00E9e", value: "P\u00E2te collante", note: "D\u00E9conseill\u00E9 pour la pizza" },
        { label: "200\u2013250 \u00C9lev\u00E9e", value: "Mie humide", note: "Pain rapide" },
        { label: "250\u2013300 Moyenne", value: "Bon \u00E9quilibre", note: "Pizza 8-12h" },
        { label: "300\u2013400 Faible", value: "S\u00E8che, lente", note: "Pizza 24-48h" },
        { label: ">400 Tr\u00E8s faible", value: "S\u00E8che", note: "P\u00E2tes s\u00E8ches" },
      ],
    },
    hydration: {
      name: "Hydratation (H%)",
      definition: "Pourcentage en poids d'eau par rapport \u00E0 la farine dans la p\u00E2te.",
      whyImportant: "H basse (<55%) : croustillante, facile. H moyenne (60-65%) : \u00E9quilibre. H \u00E9lev\u00E9e (>70%) : demande une farine forte (W>280) et du savoir-faire.",
      ranges: [
        { label: "Napolitaine classique", value: "55\u201360%", note: "Moelleuse, maniable" },
        { label: "Napolitaine contemporaine", value: "60\u201365%", note: "Corniche l\u00E9g\u00E8re" },
        { label: "Canotto", value: "65\u201370%", note: "Grandes alv\u00E9oles" },
        { label: "Pinsa romaine", value: "75\u201385%", note: "\u00C9tal\u00E9e en plaque" },
        { label: "Focaccia/Bonci", value: "85\u2013100%+", note: "P\u00E2te quasi liquide" },
      ],
    },
    absorption: {
      name: "Absorption d'eau",
      definition: "Quantit\u00E9 maximale d'eau qu'une farine peut absorber tout en gardant une consistance maniable. D\u00E9pend des prot\u00E9ines, de l'amidon endommag\u00E9 et des fibres.",
      ranges: [
        { label: "00 faible (W150)", value: "50\u201352%" },
        { label: "00 moyenne (W220)", value: "53\u201355%" },
        { label: "00 forte (W280)", value: "56\u201358%" },
        { label: "Compl\u00E8te", value: "65\u201375%" },
        { label: "Manitoba (W380)", value: "60\u201365%" },
      ],
    },
    stability: {
      name: "Stabilit\u00E9 de la p\u00E2te",
      definition: "Dur\u00E9e pendant laquelle la p\u00E2te garde une consistance optimale au p\u00E9trissage. Mesur\u00E9e au farinographe.",
      whyImportant: "Stabilit\u00E9 faible (<5 min) : se d\u00E9grade si elle est trop p\u00E9trie. \u00C9lev\u00E9e (>10 min) : tol\u00E8re les erreurs de manipulation.",
      ranges: [
        { label: "Faible", value: "2\u20134 min" },
        { label: "Moyenne", value: "5\u20138 min" },
        { label: "Forte", value: "10\u201315 min" },
        { label: "Manitoba", value: "15\u201320 min" },
      ],
    },
    yeast: {
      name: "Levure (Saccharomyces cerevisiae)",
      definition: "Champignon unicellulaire qui convertit les sucres en CO\u2082 + \u00E9thanol + compos\u00E9s aromatiques.",
      whyImportant: "Temp. optimale : 28-32\u00B0C. Min 4\u00B0C (dormante). Max 40\u00B0C (inhib\u00E9e). Mort >55\u00B0C.",
      ranges: [
        { label: "Fra\u00EEche", value: "0.5\u20132.0%", note: "Humidit\u00E9 70%, frigo 4\u00B0C" },
        { label: "S\u00E8che active", value: "0.3\u20131.0%", note: "R\u00E9hydrater avant" },
        { label: "S\u00E8che instantan\u00E9e", value: "0.2\u20130.8%", note: "Directement" },
      ],
    },
    lab: {
      name: "LAB (Bact\u00E9ries lactiques)",
      definition: "Bact\u00E9ries qui fermentent les sucres en produisant de l'acide lactique (et ac\u00E9tique). Pr\u00E9sentes dans le levain.",
      whyImportant: "Abaissent le pH (4.0-4.5), augmentent l'acidit\u00E9, d\u00E9gradent les FODMAP (fructanes), inhibent les moisissures. Temp. optimale : 28-32\u00B0C.",
    },
    q10: {
      name: "Q\u2081\u2080 (Coefficient de temp\u00E9rature)",
      definition: "Facteur multiplicatif de la vitesse de r\u00E9action biochimique pour chaque hausse de 10\u00B0C.",
      whyImportant: "Avec Q\u2081\u2080 = 2, la fermentation double tous les +10\u00B0C : 24h \u00E0 18\u00B0C \u2248 12h \u00E0 28\u00B0C. Les valeurs ci-dessous sont des estimations du mod\u00E8le {brand}.",
      ranges: [
        { label: "Levure commerciale \u226510\u00B0C", value: "2.0", note: "Estimation du mod\u00E8le, coh\u00E9rente avec les donn\u00E9es de croissance entre 18 et 25 \u00B0C" },
        { label: "Levure commerciale <10\u00B0C", value: "1.6", note: "Estimation du mod\u00E8le, sans source" },
        { label: "Levain >15\u00B0C", value: "2.2", note: "Estimation du mod\u00E8le" },
        { label: "Levain \u226415\u00B0C", value: "1.9", note: "Estimation du mod\u00E8le" },
      ],
    },
    arrhenius: {
      name: "\u00C9quation d'Arrhenius",
      definition: "D\u00E9crit la d\u00E9pendance de la vitesse de r\u00E9action \u00E0 la temp\u00E9rature absolue.",
      whyImportant: "Avec \u03B2=0.075 et T_ref=18\u00B0C \u2192 Q\u2081\u2080 \u2248 2.12. Utilis\u00E9e dans le moteur {brand} pour calculer le dosage de levure et les temps.",
    },
    biga: {
      name: "Biga",
      definition: "Pr\u00E9-p\u00E2te ferme (44-50% d'hydratation) avec farine + eau + levure, ferment\u00E9e 16-24h \u00E0 16-18\u00B0C.",
      whyImportant: "Apporte force, extensibilit\u00E9, go\u00FBt complexe, alv\u00E9olage irr\u00E9gulier et rustique, conservation plus longue. Dosage : 20-40% de la farine totale.",
    },
    poolish: {
      name: "Poolish",
      definition: "Pr\u00E9-p\u00E2te liquide (100% d'hydratation) avec farine + eau 1:1 + levure, ferment\u00E9e 12-16h \u00E0 16-18\u00B0C.",
      whyImportant: "Extensibilit\u00E9 \u00E9lev\u00E9e, alv\u00E9olage fin et r\u00E9gulier, go\u00FBt doux-acidul\u00E9, cro\u00FBte fine et croustillante. Poolish = extensibilit\u00E9 ; Biga = force.",
    },
    autolysis: {
      name: "Autolyse",
      definition: "Repos de farine + eau (sans levure ni sel) pendant 20-60 min. Les enzymes prot\u00E9ases d\u00E9veloppent le gluten spontan\u00E9ment.",
      whyImportant: "R\u00E9duit le temps de p\u00E9trissage de 30-50%, augmente l'extensibilit\u00E9, am\u00E9liore l'hydratation. 20-30 min pour W<200, 45-60 min pour W>280.",
    },
    bulk_fermentation: {
      name: "Pointage (fermentation en masse)",
      definition: "Premi\u00E8re phase de fermentation apr\u00E8s le p\u00E9trissage, avant la division en p\u00E2tons. La p\u00E2te repose en une seule masse 30 min \u2013 4h.",
      whyImportant: "D\u00E9tente du gluten, d\u00E9but de la fermentation, d\u00E9veloppement des ar\u00F4mes, augmentation de volume de 20-50%.",
    },
    ball_fermentation: {
      name: "Appr\u00EAt (fermentation en p\u00E2tons)",
      definition: "Deuxi\u00E8me phase de fermentation apr\u00E8s la division en p\u00E2tons. Chaque p\u00E2ton repose individuellement 4-48h \u00E0 4-22\u00B0C.",
      whyImportant: "Fermentation principale, maturation par prot\u00E9olyse, d\u00E9veloppement du volume final, stabilisation du pH.",
    },
    maillard: {
      name: "R\u00E9action de Maillard",
      definition: "R\u00E9action non enzymatique entre acides amin\u00E9s et sucres r\u00E9ducteurs \u00E0 haute temp\u00E9rature (>140\u00B0C).",
      whyImportant: "Cro\u00FBte dor\u00E9e (m\u00E9lano\u00EFdines), ar\u00F4me grill\u00E9 (pyrazines), l\u00E9opardage \u00E0 300\u00B0C+. Optimale \u00E0 160-180\u00B0C.",
    },
    caramelization: {
      name: "Caram\u00E9lisation",
      definition: "D\u00E9gradation thermique des sucres (sans prot\u00E9ines) \u00E0 haute temp\u00E9rature (>150\u00B0C saccharose, >120\u00B0C fructose).",
      whyImportant: "Contribue aux taches sombres sur la corniche. Moins d\u00E9terminante que la r\u00E9action de Maillard dans la pizza (peu de prot\u00E9ines en surface).",
    },
    starch_gelatinization: {
      name: "G\u00E9latinisation de l'amidon",
      definition: "Passage de l'amidon d'un \u00E9tat cristallin \u00E0 un \u00E9tat g\u00E9lifi\u00E9 par absorption d'eau. D\u00E9but 55-60\u00B0C, pic 65-70\u00B0C, fin 80-85\u00B0C.",
      whyImportant: "Mie : rend l'amidon digestible (<55\u00B0C \u00E0 c\u0153ur = amidon cru). Cro\u00FBte : >100\u00B0C \u2192 croustillante.",
    },
    retrogradation: {
      name: "R\u00E9trogradation",
      definition: "Recristallisation de l'amidon g\u00E9latinis\u00E9 pendant la conservation. Maximale \u00E0 4\u00B0C (frigo).",
      whyImportant: "La mie devient dure et \u00AB rassise \u00BB. \u00C0 retarder avec : mati\u00E8res grasses 2-3%, sucres 1-2%, fermentation longue, hydratation \u00E9lev\u00E9e.",
    },
    thermal_conductivity: {
      name: "Conductivit\u00E9 thermique",
      definition: "Capacit\u00E9 d'un mat\u00E9riau \u00E0 conduire la chaleur.",
      whyImportant: "Acier (k=50) : id\u00E9al pour les fours domestiques \u00E0 280\u00B0C, cuisson 6-8 min. Pierre (k=2) : id\u00E9ale pour les fours \u00E0 bois \u00E0 450\u00B0C+, cuisson 60-90s.",
      ranges: [
        { label: "Cuivre", value: "400" },
        { label: "Aluminium", value: "205" },
        { label: "Acier au carbone", value: "50" },
        { label: "Acier inox", value: "16" },
        { label: "Cordi\u00E9rite (pierre)", value: "2.5\u20133.5" },
        { label: "Pierre r\u00E9fractaire", value: "1.0\u20131.5" },
        { label: "P\u00E2te \u00E0 pizza", value: "0.5" },
      ],
    },
    fodmap: {
      name: "FODMAP",
      definition: "Fermentable Oligosaccharides, Disaccharides, Monosaccharides And Polyols. Glucides fermentescibles \u00E0 cha\u00EEne courte (fructanes 1-3% dans le bl\u00E9).",
      whyImportant: "L'intestin ne dig\u00E8re pas les fructanes \u2192 les bact\u00E9ries les fermentent \u2192 gaz/ballonnements. Une fermentation longue les r\u00E9duit : 24h\u219260-70%, 48h\u219280-85%.",
    },
    histamine: {
      name: "Histamine",
      definition: "Amine biog\u00E8ne issue de la d\u00E9carboxylation de l'histidine. Produite par les LAB pendant la fermentation, pr\u00E9sente dans les fromages affin\u00E9s et la charcuterie.",
      whyImportant: "Accumulation lin\u00E9aire avec le temps. Levain 24h/28\u00B0C \u2192 30-50 mg/kg. Personnes avec un d\u00E9ficit en DAO : r\u00E9action pseudo-allergique. Solution : fermentation courte (<12h) + levure commerciale.",
    },
    gluten: {
      name: "Gluten",
      definition: "Complexe prot\u00E9ique visco\u00E9lastique form\u00E9 par la gliadine (extensible) + la glut\u00E9nine (tenace) en pr\u00E9sence d'eau et de p\u00E9trissage.",
      whyImportant: "\u00C9lasticit\u00E9 due aux glut\u00E9nines (liaisons S-S), viscosit\u00E9 due aux gliadines (liaisons H). Une prot\u00E9olyse longue coupe les liaisons \u2192 p\u00E2te plus extensible.",
    },
    proteolysis: {
      name: "Prot\u00E9olyse",
      definition: "D\u00E9gradation des prot\u00E9ines en peptides et acides amin\u00E9s par les enzymes prot\u00E9ases. Cible : le gluten.",
      whyImportant: "\u00C9talage plus facile, meilleure digestibilit\u00E9, acides amin\u00E9s libres \u2192 go\u00FBt umami. Excessive (>72h) : p\u00E2te trop molle. Optimale : 24-48h.",
    },
    thickness_factor: {
      name: "Thickness Factor (TF)",
      definition: "Densit\u00E9 surfacique de la p\u00E2te \u2014 masse par unit\u00E9 de surface. Indique la quantit\u00E9 de p\u00E2te par cm\u00B2.",
      whyImportant: "D\u00E9termine le temps de cuisson, le croustillant et la densit\u00E9 calorique. M\u00E9trique originale du Projet {brand}.",
      ranges: [
        { label: "Napolitaine", value: "0.30\u20130.36", note: "6-7 mm" },
        { label: "Romaine ronde", value: "0.20\u20130.25", note: "4-5 mm" },
        { label: "New York", value: "0.40\u20130.50", note: "8-10 mm" },
        { label: "Chicago deep dish", value: "1.00\u20131.30", note: "20-26 mm" },
      ],
    },
    friction_factor: {
      name: "Friction Factor (facteur de friction)",
      definition: "Hausse de la temp\u00E9rature de la p\u00E2te (\u00B0C) par minute de p\u00E9trissage, due \u00E0 la friction m\u00E9canique.",
      whyImportant: "Le p\u00E9trissage g\u00E9n\u00E8re de la chaleur \u2192 la temp\u00E9rature monte \u2192 fermentation trop rapide. Utilis\u00E9 dans la R\u00E8gle du 55.",
      ranges: [
        { label: "\u00C0 la main", value: "0.0" },
        { label: "Robot p\u00E2tissier domestique", value: "0.8\u20131.0" },
        { label: "P\u00E9trin \u00E0 spirale professionnel", value: "0.4\u20130.6" },
        { label: "P\u00E9trin \u00E0 fourche", value: "0.2\u20130.3" },
      ],
    },
    rule_of_55: {
      name: "R\u00E8gle du 55",
      definition: "Formule empirique pour calculer la temp\u00E9rature de l'eau n\u00E9cessaire pour atteindre la temp\u00E9rature de p\u00E2te vis\u00E9e.",
      whyImportant: "55 = constante empirique (varie de 50 \u00E0 60 selon les machines). \u0394T_friction = Friction Factor \u00D7 temps de p\u00E9trissage.",
    },
    a_score: {
      name: "A-Score (Authenticit\u00E9)",
      definition: "Score 0-100 qui mesure la fid\u00E9lit\u00E9 d'une recette au cahier des charges du style vis\u00E9.",
      ranges: [
        { label: "90-100", value: "Rigoureusement authentique" },
        { label: "75-89", value: "Globalement authentique" },
        { label: "60-74", value: "Inspir\u00E9e du style" },
        { label: "<60", value: "\u00C9cart important" },
      ],
    },
    f_score: {
      name: "F-Score (Faisabilit\u00E9)",
      definition: "Score 0-100 qui mesure la faisabilit\u00E9 pratique compte tenu de l'\u00E9quipement et du niveau de l'utilisateur.",
      ranges: [
        { label: "90-100", value: "Tr\u00E8s faisable" },
        { label: "75-89", value: "Faisable avec attention" },
        { label: "60-74", value: "Difficile" },
        { label: "<60", value: "D\u00E9conseill\u00E9" },
      ],
    },
    d_score: {
      name: "D-Score (Digestibilit\u00E9)",
      definition: "Score 0-100 qui estime la digestibilit\u00E9 \u00E0 partir des heures de fermentation normalis\u00E9es et de la r\u00E9duction des FODMAP.",
      ranges: [
        { label: "85-100", value: "\u00C9lev\u00E9e (>48h \u00E9quivalentes)" },
        { label: "70-84", value: "Moyenne \u00E0 \u00E9lev\u00E9e (24-48h)" },
        { label: "50-69", value: "Moyenne (12-24h)" },
        { label: "<50", value: "Faible (<12h)" },
      ],
    },
  },
};