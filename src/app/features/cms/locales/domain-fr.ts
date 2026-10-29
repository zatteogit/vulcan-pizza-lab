/* === DOMAIN DATA i18n — Français === */
import type {
  CmsPreFerment,
  CmsTroubleshootingI18n,
  CmsGlossaryTerms,
  CmsScience,
} from "../cms-context";

export const PRE_FERMENT_FR: Partial<CmsPreFerment> = {
  sectionLabel: "Pr\u00E9-ferment",
  tipsLabel: "Conseils",
  showComparison: "Comparer Biga vs Poolish vs Autolyse",
  paramHydration: "Hydratation",
  paramDuration: "Dur\u00E9e",
  paramTemperature: "Temp\u00E9rature",
  paramYeast: "Levure",
  detailFermentation: "Fermentation",
  detailFlavor: "Saveur",
  detailCrust: "Cro\u00FBte",
  detailExtensibility: "Extensibilit\u00E9",
  detailIdealStyles: "Styles id\u00E9aux",
  compLabels: [
    "Hydratation",
    "Levure",
    "Durée",
    "Température",
    "Saveur",
    "Extensibilité",
  ],
  items: {
    poolish: {
      origin: "Pologne, puis France",
      description:
        "Préferment liquide : farine et eau à parts égales avec peu de levure, 12–16 h à 20–22 °C.",
      hydration: "100 % (farine et eau à parts égales)",
      consistency: "Liquide, mousseux",
      fermentationType:
        "Rapide : avec autant d'eau, il mûrit en quelques heures",
      flavor: "Légèrement acidulé, notes de noisette",
      crustResult:
        "Fine et dorée ; couleur et taches dépendent du four et de la température",
      extensibility:
        "Élevée (estimation) : facile à étaler",
      idealStyles:
        "Teglia Romana, NY Style, Napolitaine contemporaine, Focaccia",
      tips: [
        "Prêt quand la surface est couverte de bulles et que le centre commence à s'affaisser",
        "Plus de levure, moins d'heures : à 20–22 °C, 0,1 % pour 15–16 h, 0,3 % pour 10–12 h",
        "Farine dans le poolish : 30–50 % de la farine totale",
      ],
    },
    biga: {
      origin: "Italie",
      description:
        "Préferment ferme : farine, 44 % d'eau et 1 % de levure, environ 16 h à 18–20 °C.",
      hydration: "44 % (jusqu'à 50 % avec des farines complètes)",
      consistency: "S\u00E8che, compacte",
      fermentationType: "Lente : avec peu d'eau, elle mûrit en 16–48 h",
      flavor: "Aromatique, florale",
      crustResult: "Croustillante ; la structure dépend de l'hydratation et du façonnage",
      extensibility:
        "Dépend de la farine et de l'hydratation (à vérifier)",
      idealStyles:
        "Pinsa, Pizza al taglio, Pala romana, Pain",
      tips: [
        "Prête quand elle a gonflé par endroits, sent le yaourt et pétille un peu ; si elle a un goût acide, elle est allée trop loin",
        "Biga longue : 24 h à 4–5 °C, puis 24 h à 18–20 °C",
        "Farine dans la biga : 20–50 % de la farine totale, souvent un tiers",
        "Pas utilisée pour la Napolitaine STG : le cahier des charges n'admet que la méthode directe",
      ],
    },
    autolisi: {
      origin: "R. Calvel, France 1974",
      description:
        "Ce n'est pas un préferment : farine et eau reposent sans levure ni sel avant le pétrissage.",
      hydration: "Celle de la recette (on garde souvent un peu d'eau de côté)",
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
        "Repos de 20–60 minutes ; levure et sel s'ajoutent ensuite",
        "Se combine avec la biga ou le poolish",
      ],
    },
  },
  compValues: {
    hydration: {
      biga: "44 %",
      poolish: "100%",
      autolisi: "= recette",
    },
    yeast: {
      biga: "1 %",
      poolish: "0,1–0,3 %",
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
      autolisi: "Ambiante",
    },
    flavor: {
      biga: "Aromatique",
      poolish: "Légèrement acidulé",
      autolisi: "Neutre",
    },
    extensibility: {
      biga: "Variable",
      poolish: "Élevée (estimation)",
      autolisi: "\u00C9lev\u00E9e",
    },
  },
};



export const TROUBLESHOOTING_FR: Partial<CmsTroubleshootingI18n> =
  {
    categories: {
      frying: "Friture",
      dough: "P\u00E2te",
      fermentation: "Fermentation",
      shaping: "\u00C9talage",
      baking: "Cuisson",
      solver: "Algorithme",
      false_positive: "Fausses alertes",
    },
    issues: {
      FR01: {
        symptom: "Dorée dehors, crue dedans",
        cause: "Huile trop chaude ou pâte trop épaisse.",
        testRapido: "Ouvre une pièce test et vérifie le centre.",
        fixImmediate: "Baisse le feu pour les pièces suivantes ; la couleur seule ne suffit pas.",
        prevention: "Utilise un thermomètre et respecte la température d’huile de la recette.",
      },
      FR02: {
        symptom: "Trop grasse et peu croustillante",
        cause: "Huile trop froide ou refroidie par trop de pièces à la fois.",
        testRapido: "Vérifie la température entre les fournées.",
        fixImmediate: "Laisse l’huile revenir à la température prévue ; cuis de petites quantités et égoutte bien.",
        prevention: "Ne surcharge pas le récipient et surveille la température pendant la friture.",
      },
      FR03: {
        symptom: "La farce fuit dans l’huile",
        cause: "Bords mal scellés, trous ou farce sur les bords.",
        testRapido: "Vérifie la fermeture des pièces encore crues.",
        fixImmediate: "Scelle mieux les pièces suivantes ; ne verse jamais d’eau dans l’huile chaude.",
        prevention: "Garde les bords propres, dose la farce et ferme sans percer la pâte.",
      },

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
          "Réfrigérer la pâte pour ralentir la fermentation ; le froid ne l’arrête pas immédiatement.",
        prevention:
          "Utiliser la dose de levure calculée pour vos heures et votre température (à 18 °C pendant 24 h, environ 0,1 % de levure fraîche)",
      },
      P06: {
        symptom: "Saveur trop acide/ac\u00E9tique",
        cause:
          "LAB h\u00E9t\u00E9rofermentatifs actifs >48h \u00E0 >18\u00B0C (surtout avec levain)",
        testRapido:
          "pH p\u00E2te \u2014 devrait \u00EAtre 4.5-5.5, probl\u00E9matique si <4.2",
        fixImmediate:
          "Le sucre masque le goût sans corriger la surfermentation. Réévaluer la pâte avant usage.",
        prevention:
          "Choisir durée, température et levure selon la méthode ; aucun seuil horaire universel.",
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
          "Ajouter 0,5–1 % de sucre ou de malt et pousser le four au maximum, avec une pierre ou un acier bien préchauffés",
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
          "Fines bulles de la corniche qui foncent sous la très forte chaleur du four (brunissement et carbonisation localisés)",
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
        prevention: "Mesurer la température du rayon utilisé et observer la pâte. Le sucre ne corrige pas les variations du réfrigérateur.",
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
          "Fermentation courte : vérifier le développement de la pâte avant de poursuivre.",
        tip: "Vérifier volume, élasticité et réaction à la pression : les heures seules ne prouvent pas la digestibilité.",
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
      plainDefinition: "La force de la farine : plus elle est élevée, plus la pâte tient longtemps pendant la levée. Elle est souvent indiquée sur le paquet (par exemple W 280).",
      name: "W (Alv\u00E9ographe de Chopin)",
      definition: "\u00C9nergie totale n\u00E9cessaire pour gonfler une bulle de p\u00E2te jusqu'\u00E0 la rupture. Mesure la force globale de la farine.",
      whyImportant: "W décrit la force globale de la farine. Ténacité et extensibilité se jugent avec P, L et P/L : un W élevé ne signifie pas à lui seul une pâte plus tenace.",
      ranges: [
        { label: "Faible", value: "90\u2013160", note: "Biscuits, gaufrettes" },
        { label: "Moyenne", value: "160\u2013200", note: "Pain de mie, focaccia" },
        { label: "Moyenne-forte", value: "200\u2013280", note: "Pizza napolitaine" },
        { label: "Forte", value: "280\u2013350", note: "Pains \u00E0 longue fermentation" },
        { label: "Tr\u00E8s forte", value: "350\u2013450", note: "Panettone, croissant" },
      ],
    },
    p_tenacity: {
      plainDefinition: "La résistance de la pâte quand vous l’étirez.",
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
      plainDefinition: "Jusqu’où la pâte s’allonge avant de se déchirer.",
      name: "L (Extensibilit\u00E9)",
      definition: "Longueur maximale atteinte par la bulle avant la rupture. Mesure jusqu'o\u00F9 la p\u00E2te peut s'allonger.",
      whyImportant: "L \u00E9lev\u00E9 : p\u00E2te extensible, facile \u00E0 \u00E9taler sans d\u00E9chirures. L bas : p\u00E2te courte, se d\u00E9chire.",
      ranges: [
        { label: "Pizza", value: "80\u2013120 mm" },
        { label: "Pain", value: "60\u2013100 mm" },
      ],
    },
    pl_ratio: {
      plainDefinition: "Indique si la pâte a tendance à se rétracter (valeur élevée) ou à s’étirer facilement (valeur basse).",
      name: "P/L (Rapport T\u00E9nacit\u00E9/Extensibilit\u00E9)",
      definition: "Le rapport entre la résistance de la pâte à la déformation et sa capacité à s’étirer.",
      whyImportant: "Décrit l’équilibre rhéologique. La valeur adaptée dépend de la farine, de l’hydratation et de la méthode ; sans garantie de hauteur ou texture.",
      ranges: [
        { label: "Tr\u00E8s extensible · S'affaisse facilement", value: "<0.4", note: "Pinsa" },
        { label: "Extensible · Facile \u00E0 travailler", value: "0.4\u20130.5", note: "Napolitaine classique" },
        { label: "\u00C9quilibr\u00E9 · Bon \u00E9quilibre", value: "0.5\u20130.7", note: "Napolitaine moderne, pain" },
        { label: "Tenace · R\u00E9sistante", value: "0.7\u20131.0", note: "Pains \u00E0 longue fermentation" },
        { label: "Tr\u00E8s tenace · \u00C9lastique, se r\u00E9tracte", value: ">1.0", note: "Croissant" },
      ],
    },
    falling_number: {
      plainDefinition: "Indique l’activité des enzymes de la farine qui transforment l’amidon en sucres.",
      name: "Falling Number (Hagberg-Perten)",
      definition: "Temps mis par une tige pour descendre \u00E0 travers une suspension de farine chauff\u00E9e. Mesure l'activit\u00E9 amylasique.",
      whyImportant: "FN bas (<250) : fermentation rapide mais p\u00E2te instable. FN \u00E9lev\u00E9 (>300) : stable pour les longues maturations.",
      ranges: [
        { label: "Amylase tr\u00E8s \u00E9lev\u00E9e · P\u00E2te collante", value: "<200", note: "D\u00E9conseill\u00E9 pour la pizza" },
        { label: "\u00C9lev\u00E9e · Mie humide", value: "200\u2013250", note: "Pain rapide" },
        { label: "Moyenne · Bon \u00E9quilibre", value: "250\u2013300", note: "Pizza 8-12h" },
        { label: "Faible · S\u00E8che, lente", value: "300\u2013400", note: "Pizza 24-48h" },
        { label: "Tr\u00E8s faible · S\u00E8che", value: ">400", note: "P\u00E2tes s\u00E8ches" },
      ],
    },
    hydration: {
      formula: "H% = (poids de l’eau / poids de la farine) × 100",
      plainDefinition: "La quantité d’eau dans la pâte par rapport à la farine : à 65 %, vous mettez 65 g d’eau pour 100 g de farine.",
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
      definition: "La durée pendant laquelle la pâte garde sa consistance au pétrissage. Elle se mesure au farinographe.",
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
      definition: "Un champignon unicellulaire qui fermente les sucres en produisant du dioxyde de carbone, de l’alcool et des composés aromatiques.",
      whyImportant: "L’activité dépend de la souche, de la dose, de la température et de la pâte. Le froid ralentit la fermentation sans seuil universel d’arrêt immédiat.",
      ranges: [
        { label: "Fra\u00EEche", value: "0.5\u20132.0%", note: "Humidit\u00E9 70%, frigo 4\u00B0C" },
        { label: "S\u00E8che active", value: "0.3\u20131.0%", note: "R\u00E9hydrater avant" },
        { label: "S\u00E8che instantan\u00E9e", value: "0.2\u20130.8%", note: "Directement" },
      ],
    },
    lab: {
      plainDefinition: "Les bactéries du levain qui donnent à la pâte son goût légèrement acidulé.",
      name: "LAB (Bact\u00E9ries lactiques)",
      definition: "Bact\u00E9ries qui fermentent les sucres en produisant de l'acide lactique (et ac\u00E9tique). Pr\u00E9sentes dans le levain.",
      whyImportant: "Ils peuvent modifier acidité et fructanes selon souches, farine et procédé. Leur présence ne certifie pas une pâte low FODMAP.",
    },
    q10: {
      plainDefinition: "Combien de fois la levée accélère quand il fait 10 °C de plus.",
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
      definition: "Préferment ferme de farine, 44 % d'eau (jusqu'à 50 % avec des farines complètes) et 1 % de levure, mûri environ 16 h à 18–20 °C ; la biga longue demande 24 h à 4–5 °C puis 24 h à 18–20 °C.",
      whyImportant: "Apporte arôme et structure à la pâte finale. Souvent un tiers de la farine totale (20–50 %). Non admise pour la Napolitaine STG, qui est en direct.",
    },
    poolish: {
      name: "Poolish",
      definition: "Préferment liquide : farine et eau à parts égales avec peu de levure, mûri 12–16 h à 20–22 °C (0,1 % de levure pour 15–16 h, 0,3 % pour 10–12 h).",
      whyImportant: "Mûrit vite et rend la pâte extensible. Souvent 30–50 % de la farine totale. Prêt quand la surface est couverte de bulles et que le centre commence à s'affaisser.",
    },
    autolysis: {
      name: "Autolyse",
      definition: "Repos de la farine et de l'eau, sans levure ni sel, pendant 20–60 minutes avant le pétrissage (R. Calvel, 1974). Ce n'est pas un préferment.",
      whyImportant: "La pâte devient plus extensible et plus facile à travailler.",
    },
    bulk_fermentation: {
      name: "Pointage (fermentation en masse)",
      definition: "Premier pointage, en masse, après le pétrissage et avant le boulage. Selon le style, de moins d'une heure à plus d'un jour au réfrigérateur : la bonne durée est celle du déroulé.",
      whyImportant: "Le gluten se détend, la fermentation démarre et la pâte prend de l'arôme.",
    },
    ball_fermentation: {
      name: "Appr\u00EAt (fermentation en p\u00E2tons)",
      definition: "Second apprêt, après le boulage : en pâtons ou, pour les styles en plaque, directement dans la plaque. La durée dépend du style, de la température et de la levure : la bonne durée est celle du déroulé.",
      whyImportant: "Amène les pâtons au bon volume pour étaler et enfourner.",
    },
    maillard: {
      name: "R\u00E9action de Maillard",
      definition: "Ensemble de réactions non enzymatiques entre composés aminés et sucres réducteurs, favorisées par le chauffage.",
      whyImportant: "Elle contribue à la couleur et aux arômes de la croûte. Son intensité dépend de la température de surface, du temps, de l’humidité et des ingrédients ; la température du four n’est pas celle de l’aliment.",
    },
    caramelization: {
      name: "Caram\u00E9lisation",
      definition: "Transformations des sucres au chauffage, distinctes des réactions de Maillard et ne nécessitant pas de composés aminés.",
      whyImportant: "Elle peut contribuer à la couleur et aux arômes grillés. Son effet dépend des sucres présents, de l’humidité, du temps et de la température de surface.",
    },
    starch_gelatinization: {
      name: "G\u00E9latinisation de l'amidon",
      definition: "Avec l’eau et la chaleur, les granules d’amidon s’hydratent, gonflent et perdent une partie de leur structure cristalline. La plage dépend de l’amidon et de la formulation.",
      whyImportant: "Elle contribue à la structure de la mie et à la transformation de l’amidon. Une température à cœur seule ne certifie ni la cuisson complète ni la digestibilité individuelle.",
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
      whyImportant: "La fermentation peut modifier les FODMAP, mais le résultat dépend des farines, des micro-organismes, du procédé et de la portion. Les seules heures ne permettent ni de chiffrer la réduction ni de qualifier la recette de pauvre en FODMAP.",
    },
    histamine: {
      name: "Histamine",
      definition: "Amine biog\u00E8ne issue de la d\u00E9carboxylation de l'histidine. Produite par les LAB pendant la fermentation, pr\u00E9sente dans les fromages affin\u00E9s et la charcuterie.",
      whyImportant: "La teneur dépend des micro-organismes, ingrédients, procédé et conservation. Elle ne se calcule pas avec un taux horaire fixe ; une fermentation courte ne garantit pas son absence.",
    },
    gluten: {
      name: "Gluten",
      definition: "La gliadine et la gluténine forment, avec l’eau et le travail de la pâte, un réseau élastique et extensible.",
      whyImportant: "Élasticité due aux gluténines (liaisons S-S), viscosité due aux gliadines (liaisons H). Une protéolyse longue rend la pâte plus extensible, mais le gluten reste : une fermentation longue ou au levain ne rend pas la pizza adaptée aux personnes cœliaques. Vous indiquez allergies et intolérances dans votre Profil.",
    },
    proteolysis: {
      name: "Prot\u00E9olyse",
      definition: "Les enzymes protéases décomposent les protéines de la pâte en molécules plus petites, comme les peptides et les acides aminés.",
      whyImportant: "Elle peut modifier l’extensibilité et la tenue de la pâte. Elle dépend de la farine, des micro-organismes, de la température et du procédé : aucune durée optimale universelle et aucune mesure de la digestibilité individuelle.",
    },
    thickness_factor: {
      formula: "TF = poids du pâton (g) / surface de la pizza (cm²)",
      plainDefinition: "La quantité de pâte nécessaire par centimètre carré de pizza : plus elle est élevée, plus la pizza est épaisse.",
      name: "Thickness Factor (TF)",
      definition: "Quantité de pâte par unité de surface : les grammes de pâte pour chaque cm² de pizza.",
      whyImportant: "Une mesure répandue dans les calculateurs de pâte nord-américains (en oz/in² ; 1 oz/in² ≈ 4,39 g/cm²). {brand} l'exprime en g/cm² pour dimensionner les pâtons ; avec le four, elle oriente le temps de cuisson et le croustillant.",
      ranges: [
        { label: "Napolitaine", value: "0.30\u20130.36", note: "6-7 mm" },
        { label: "Romaine ronde", value: "0.20\u20130.25", note: "4-5 mm" },
        { label: "New York", value: "0.40\u20130.50", note: "8-10 mm" },
        { label: "Chicago deep dish", value: "1.00\u20131.30", note: "20-26 mm" },
      ],
    },
    friction_factor: {
      name: "\u00C9chauffement du p\u00E9trin",
      definition: "Degr\u00E9s que le p\u00E9trin ajoute \u00E0 la p\u00E2te pendant le p\u00E9trissage.",
      whyImportant: "P\u00E9trir r\u00E9chauffe la p\u00E2te et fait d\u00E9marrer la pousse plus t\u00F4t : c'est pourquoi l'eau doit \u00EAtre plus froide avec une machine.",
      ranges: [
        { label: "\u00C0 la main", value: "0" },
        { label: "P\u00E9trin \u00E0 fourche", value: "2" },
        { label: "Spirale", value: "3" },
        { label: "Robot m\u00E9nager (p\u00E2tes maison)", value: "4" },
        { label: "Robot plan\u00E9taire", value: "5" },
      ],
    },
    rule_of_55: {
      formula: "T_eau = 3 × T_pâte − T_ambiante − T_farine − friction",
      name: "Temp\u00E9rature de l'eau (trois temp\u00E9ratures)",
      definition: "Calcule \u00E0 quelle temp\u00E9rature mettre l'eau pour que la p\u00E2te atteigne la temp\u00E9rature voulue.",
      whyImportant: "Somme des trois temp\u00E9ratures = 3 \u00D7 p\u00E2te voulue \u2212 \u00E9chauffement. En pizzeria on parle aussi de \u00AB r\u00E8gle du 55 \u00BB : avec une somme fixe de 55 la p\u00E2te arrive vers 18 \u00B0C (55 \u00F7 3) ; ici on utilise la cible du style, 22\u201324 \u00B0C.",
    },
    a_score: {
      formula: "A = 0,35 × ingrédients + 0,30 × procédé + 0,35 × équipement",
      name: "A-Score (Authenticit\u00E9)",
      definition: "Score de 0 à 100 sur la proximité avec le style de référence. Il ne certifie pas le respect d’un cahier des charges.",
      ranges: [
        { label: "Rigoureusement authentique", value: "90-100" },
        { label: "Globalement authentique", value: "75-89" },
        { label: "Inspir\u00E9e du style", value: "60-74" },
        { label: "\u00C9cart important", value: "<60" },
      ],
    },
    f_score: {
      formula: "F = 0,4 × four + 0,3 × farine + 0,3 × expérience",
      name: "F-Score (Facilité)",
      definition: "Score de 0 à 100 sur la facilité de préparation avec le four, la farine et l’expérience disponibles. Les conditions qui bloquent une recette sont évaluées à part.",
      ranges: [
        { label: "Tr\u00E8s faisable", value: "90-100" },
        { label: "Faisable avec attention", value: "75-89" },
        { label: "Difficile", value: "60-74" },
        { label: "D\u00E9conseill\u00E9", value: "<60" },
      ],
    },
    d_score: {
      name: "D-Score (Maturation estimée)",
      definition: "Estimation du modèle selon le temps, la température, la levure et les préferments. Elle ne mesure pas la digestibilité individuelle et ne calcule pas les FODMAP.",
      ranges: [{ label: "Indice élevé", value: "85-100" },{ label: "Indice moyen-élevé", value: "70-84" },{ label: "Indice moyen", value: "50-69" },{ label: "Indice faible", value: "<50" }],
    },
    /* FW-04: voci del procedimento e delle farine (D-044). */
    dough_division: {
      name: "Division (staglio)",
      definition: "Diviser la masse de pâte en morceaux de même poids, un par pizza, et les fermer en boule.",
      whyImportant: "Des pâtons de même poids lèvent et cuisent de la même façon. Le poids de chaque pâton est indiqué dans la recette.",
    },
    ball_shaping: {
      name: "Boulage (pirlatura)",
      definition: "Le geste qui referme le morceau de pâte en une boule lisse et tendue : vous le faites tourner sur lui-même, sur le plan de travail ou entre vos mains, jusqu’à ce que la surface soit tendue.",
      whyImportant: "Une surface tendue retient le gaz pendant l’apprêt et donne un pâton qui s’étale en rond. Si la pâte se déchire, vous avez trop tiré : laissez-la reposer quelques minutes.",
    },
    gluten_development: {
      name: "Développement du gluten (incordatura)",
      definition: "Le moment où la pâte devient lisse et élastique et ne colle plus aux mains ni au bol : le réseau de gluten s’est formé.",
      whyImportant: "Une pâte bien développée retient le gaz de la levée. Test pratique : étirez un petit morceau entre vos doigts ; s’il forme une fine pellicule sans se déchirer tout de suite, elle est prête. Pétrir trop longtemps à la machine, en revanche, chauffe et affaiblit la pâte.",
    },
    folds: {
      name: "Rabats",
      definition: "Vous étirez un pan de pâte et le rabattez sur le reste, tournez la masse et recommencez de chaque côté. On les fait à intervalles pendant le repos, au lieu de pétrir plus longtemps.",
      whyImportant: "Ils renforcent le réseau de gluten sans chauffer la pâte, surtout dans les pâtes très hydratées. Le « slap & fold » est une variante : vous soulevez la pâte, la frappez sur le plan de travail et la repliez sur elle-même.",
    },
    poke_test: {
      name: "Test du doigt (poke test)",
      definition: "Enfoncez un doigt fariné d’environ un centimètre dans le pâton et observez comment la marque remonte.",
      whyImportant: "Si la marque remonte lentement et qu’il en reste un peu, le pâton est prêt. Si elle remonte tout de suite, il lui faut encore du temps. Si elle reste enfoncée et que le pâton s’affaisse, il a trop levé. C’est une indication pratique, pas une mesure.",
    },
    cornicione: {
      name: "Cornicione (bord)",
      definition: "Le bord de la pizza, plus haut et plus gonflé que le centre : à la cuisson, le gaz de la pâte se dilate et le soulève.",
      whyImportant: "Pour l’obtenir, en étalant, poussez l’air du centre vers le bord sans l’écraser. Hauteur et alvéoles dépendent du style, de l’hydratation, de la fermentation et de la chaleur du four.",
    },
    oven_floor_dome: {
      name: "Sole et voûte",
      definition: "La sole est la surface du four sur laquelle repose la pizza ; la voûte est la partie au-dessus. La sole cuit le dessous par contact, la voûte cuit la garniture et le bord par la chaleur qu’elle rayonne.",
      whyImportant: "Si le dessous brûle alors que la garniture reste crue, la sole est trop chaude par rapport à la voûte ; dans le cas contraire, elle est trop froide. Dans un four domestique, la pierre ou l’acier jouent le rôle de sole et le gril celui de voûte.",
    },
    pre_ferment: {
      name: "Préferment",
      definition: "Une partie de la farine et de l’eau mélangée à la levure des heures avant la pâte finale et laissée à maturer. Les plus courants sont la biga (ferme) et le poolish (liquide).",
      whyImportant: "Il apporte des arômes et change la façon dont la pâte finale se travaille. Dans la recette, c’est une phase à part, et ses quantités font partie du total : elles ne s’y ajoutent pas. L’autolyse n’est pas un préferment, car elle ne contient pas de levure.",
    },
    sourdough: {
      name: "Levain (lievito madre)",
      definition: "Une pâte de farine et d’eau où vivent des levures sauvages et des bactéries lactiques, entretenue par des rafraîchis de farine et d’eau. Une partie remplace la levure de boulanger.",
      whyImportant: "Il lève plus lentement que la levure de boulanger et donne un goût légèrement acidulé. Son activité dépend de la façon dont vous le rafraîchissez : c’est pourquoi la dose de levain est une hypothèse du modèle, à adapter au vôtre.",
    },
    flour_type: {
      name: "Type de farine (00, 0, 1, 2, complète)",
      definition: "En Italie, le type indique à quel point la farine de blé tendre est raffinée : la 00 est la plus blanche, puis 0, 1, 2 et complète, qui contient tout le grain. Il est fixé par le taux de cendres, c’est-à-dire les minéraux qui restent après avoir brûlé la farine.",
      whyImportant: "Le type ne dit pas si la farine est forte : une 00 peut être faible ou très forte. La force, c’est le W, s’il figure sur le paquet. Si vous ne l’indiquez pas, le modèle suppose une plage typique pour ce type.",
    },
    manitoba: {
      name: "Manitoba",
      definition: "Farine de blé tendre riche en protéines, à l’origine issue de blés nord-américains (le nom vient de la province canadienne du Manitoba). Aujourd’hui, dans le commerce, elle désigne une farine très forte.",
      whyImportant: "On l’utilise pour les fermentations longues ou en mélange avec une 00 pour augmenter la force. Seule, elle donne une pâte tenace, plus difficile à étaler.",
    },
    semola_rimacinata: {
      name: "Semoule remoulue (semola rimacinata)",
      definition: "Semoule de blé dur moulue une seconde fois, plus fine que la semoule ordinaire : jaune et légèrement granuleuse au toucher.",
      whyImportant: "On l’utilise pour fleurer le plan de travail et la pelle, car elle fait glisser la pizza et brûle moins que la farine, et en petite quantité dans la pâte de certains styles. Le gluten du blé dur est moins extensible que celui du blé tendre.",
    },
  },
};
/* FW-01 — Registre scientifique : textes des notes et des hypothèses (clés comme SCIENCE_I18N_DEFAULTS). */
export const SCIENCE_FR: CmsScience = {
  notes: {
    "yeast-dose": {
      title: "Dose de levure",
      l1: "C'est une estimation : plus d'heures et plus de chaleur demandent moins de levure.",
      l2: "Nous partons d'une dose de référence cohérente avec les cahiers des charges napolitains et l'ajustons à vos heures et à votre température. La levure, la farine et la cuisine réelles peuvent décaler les temps : regardez la pâte plus que l'horloge.",
    },
    "q10-fermentation": {
      title: "Température et vitesse de pousse",
      l1: "Plus chaud, la pousse est plus rapide ; plus froid, plus lente. Le facteur est une estimation.",
      l2: "Le modèle utilise un facteur de vitesse par paliers par rapport à une température de référence. À température ambiante, il concorde avec les études sur la levure ; au frais et au réfrigérateur, il n'a pas de source et peut beaucoup se tromper : surveillez la pâte.",
    },
    "equivalent-hours": {
      title: "Heures équivalentes",
      l1: "Vos heures traduites en heures nécessaires à la température de référence.",
      l2: "Nous multiplions les heures par la vitesse à votre température. Si vous fermentez plus au frais que la référence (réfrigérateur, cave), l'apprêt final se fait à la température de référence : ces heures comptent telles quelles et seules les autres sont multipliées. C'est pourquoi « heures × vitesse » seul ne tombe pas juste.",
    },
    "kitchen-temp-default": {
      title: "Température de la cuisine",
      l1: "Si vous ne l'indiquez pas, nous utilisons une valeur standard.",
      l2: "La température de la cuisine change les temps de pousse et la température de l'eau. La valeur standard est une hypothèse : si votre cuisine est plus chaude ou plus froide, indiquez-le et la recette s'adapte.",
    },
    "proof-split": {
      title: "Durée de l'apprêt",
      l1: "Quand le style ne l'indique pas, l'apprêt est une part fixe des heures totales.",
      l2: "C'est une hypothèse du modèle, pas une règle de la méthode. Si la cuisine est plus chaude que prévu, la pâte est prête plus tôt : vérifiez-la.",
    },
    "sourdough-starter-dose": {
      title: "Dose de levain",
      l1: "La dose de levain est une règle empirique qui ne dépend que des heures.",
      l2: "Elle ne tient compte ni de la température ni de la force de votre levain. La farine et l'eau du levain ne sont pas comptées dans l'hydratation affichée : la pâte réelle est un peu plus hydratée.",
    },
    "pre-ferment": {
      title: "Biga et poolish",
      l1: "Hydratation, heures et températures viennent de sources professionnelles concordantes.",
      l2: "La biga est un préferment ferme qui mûrit lentement au frais ; le poolish est liquide et mûrit plus vite. La croûte et la mie dépendent surtout du four, de l'hydratation et du façonnage, pas du seul préferment.",
    },
    autolysis: {
      title: "Autolyse",
      l1: "La farine et l'eau reposent sans levure ni sel avant le pétrissage.",
      l2: "Ce n'est pas un préferment : rien ne fermente. La farine s'hydrate et la pâte devient plus facile à travailler (R. Calvel, 1974).",
    },
    "water-temp-rule": {
      title: "Température de l'eau",
      l1: "Un calcul exact, qui part de quelques hypothèses sur votre cuisine.",
      l2: "Cuisine, farine, eau et chauffe du pétrin font trois fois la température de pâte voulue. L'arithmétique est exacte ; cuisine et farine sont des estimations si vous ne les mesurez pas, et la chauffe du pétrin est une valeur type.",
    },
    "water-activity": {
      title: "Activité de l'eau (aw)",
      l1: "Un indice estimé, pas une mesure.",
      l2: "Nous le calculons avec une formule simple à partir de l'hydratation, du sel et du sucre. Il sert à comparer des recettes, pas à dire combien de temps la pizza se conserve : une vraie valeur demande un instrument.",
    },
    "dough-indices": {
      title: "Indices de la pâte",
      l1: "Réseau de gluten et protéolyse sont des indices du modèle, pas des mesures.",
      l2: "Ils combinent force de la farine, hydratation et heures avec des poids choisis par {brand}. Ils servent à comparer deux recettes, ce ne sont pas des valeurs de laboratoire.",
    },
    "salt-range": {
      title: "Plage du sel",
      l1: "Les repères du sel sont un choix de {brand}, pas une plage issue d'une source.",
      l2: "Pour la Napoletana STG, le cahier des charges donne une plage précise ; pour les autres styles, nous montrons une bande étroite autour de la valeur de la recette.",
    },
    "stg-salt-timing": {
      title: "Le sel dans la Napoletana STG",
      l1: "Le cahier des charges dissout le sel dans l'eau avant d'ajouter la farine.",
      l2: "C'est l'ordre du règlement UE de la STG. D'autres méthodes ajoutent le sel plus tard : pour ce style, nous suivons le cahier des charges.",
    },
    "flour-w-by-grade": {
      title: "Type de farine et force",
      l1: "00, 0, 1 et complète disent à quel point la farine est raffinée, pas sa force.",
      l2: "La force (W) varie d'un sac à l'autre, même pour un même type. Si le sac ne l'indique pas, le modèle utilise une estimation par type : pour une vraie valeur, consultez la fiche du meunier.",
    },
    "flour-pl-estimate": {
      title: "P/L estimé",
      l1: "Si vous n'indiquez pas le P/L, nous l'estimons à partir de la force de la farine.",
      l2: "C'est une relation approchée, limitée à la plage du style. La vraie valeur figure sur la fiche technique de la farine.",
    },
    "stg-flour-w": {
      title: "Force de la farine dans la STG",
      l1: "Nous utilisons la fourchette de l'AVPN, plus étroite que celle du cahier des charges STG.",
      l2: "Le règlement UE de la STG admet des farines plus faibles et plus fortes ; le règlement de l'AVPN resserre la plage. C'est un choix de {brand} : les deux sources sont indiquées.",
    },
    "oven-max-temp": {
      title: "Température maximale du four",
      l1: "C'est la température déclarée pour votre modèle.",
      l2: "Presque aucun fabricant ne dit s'il s'agit de l'air ou de la pierre. Quand la donnée vient d'un revendeur ou d'un test, nous le signalons ; les fours des démos ont des données inventées.",
    },
    "oven-preset-max-temp": {
      title: "Température type du type de four",
      l1: "Une valeur type : corrigez-la avec celle de votre four.",
      l2: "Pour certains types de four, nous n'avons ni fiche de fabricant ni norme. Si vous connaissez votre four, indiquez sa température : la recette s'adapte.",
    },
    "stg-oven-temp": {
      title: "Four de la Napoletana STG",
      l1: "Les deux sources donnent la même température pour des surfaces différentes.",
      l2: "Le cahier des charges STG la rapporte à la sole, celui de l'AVPN à la voûte. Aucune n'atteint le haut de la plage utilisée par le moteur : cette valeur reste à vérifier.",
    },
    "style-min-oven-temp": {
      title: "Température minimale du style",
      l1: "Pour beaucoup de styles, le minimum est un choix du modèle, sans source.",
      l2: "Sous le minimum, la recette n'est pas faisable ou moins fidèle. Là où un cahier des charges existe, nous le suivons ; sinon, le seuil reste à vérifier.",
    },
    "bake-time-home-preheat": {
      title: "Préchauffage du four domestique",
      l1: "La durée du préchauffage est une hypothèse du modèle.",
      l2: "La pierre et l'acier chauffent plus lentement que l'air : mettez-les dans le four froid, allumez et, si possible, mesurez la surface avant d'enfourner.",
    },
    "surface-conductivity": {
      title: "Conductivité de la surface",
      l1: "La vitesse à laquelle la surface transmet la chaleur à la pizza.",
      l2: "C'est la conductivité thermique typique du matériau, en W/(m·K) : les métaux viennent de tables techniques, la pierre et le réfractaire restent à vérifier. La grille n'a pas de surface de contact.",
    },
    "baking-energy": {
      title: "Énergie de cuisson",
      l1: "Un ordre de grandeur, pas une mesure.",
      l2: "Nous multiplions le temps de cuisson par une puissance type choisie selon la température du four, la même pour le bois, le gaz et l'électrique. Le préchauffage n'est pas compté.",
    },
    "thickness-factor": {
      title: "Thickness factor",
      l1: "Grammes de pâte par cm² de pizza.",
      l2: "C'est une mesure répandue dans les calculateurs de pâte nord-américains, en onces par pouce carré ; {brand} l'exprime en g/cm² pour dimensionner les pâtons.",
    },
    "score-weights": {
      title: "Poids du score",
      l1: "Les poids des dimensions sont un choix de {brand}.",
      l2: "Ils disent combien compte chaque dimension dans le chiffre final. Ils ne viennent pas d'une mesure : c'est une règle de l'app, la même pour tous.",
    },
    "non-feasible-ceiling": {
      title: "Plafond des recettes non faisables",
      l1: "Une recette que vous ne pouvez pas faire reste dans la zone basse : c'est une règle de l'app.",
      l2: "Ainsi, une recette non réalisable ne dépasse jamais une recette faisable, même si les autres dimensions sont élevées.",
    },
    "authenticity-fuel-cap": {
      title: "Plafond d'authenticité lié au combustible",
      l1: "Sans le four prévu par le style, l'authenticité a un plafond : c'est un choix de {brand}.",
      l2: "Quand un style exige le bois ou le charbon, un autre four peut bien cuire mais ne suit pas la méthode. Le plafond est une limite éditoriale, pas une mesure de qualité.",
    },
    digestibility: {
      title: "Indice de digestibilité",
      l1: "Un indice du modèle sur le procédé, pas une promesse de santé.",
      l2: "Il tient compte des heures et des températures de maturation. Il ne mesure pas comment une personne digère une pizza et n'atteste pas l'adéquation à un régime.",
    },
    "troubleshooting-thresholds": {
      title: "Seuils des problèmes",
      l1: "Les seuils chiffrés des problèmes sont indicatifs.",
      l2: "Ce sont des règles empiriques sans source publiée, qui ne tiennent pas compte du style : une pâte en plaque, par exemple, est bien plus hydratée qu'une napolitaine. Utilisez-les comme piste, pas comme diagnostic.",
    },
  },
  assumptions: {
    "constant-ferment-temp": "La température reste constante pendant toute la phase.",
    "time-exponent-no-source": "La correction selon les heures utilise un exposant choisi par le modèle, sans source.",
    "kitchen-temp-standard": "Si vous n'indiquez pas la température de la cuisine, nous utilisons une valeur standard.",
    "q10-cold-no-source": "Au frais et au réfrigérateur, le facteur de vitesse n'a pas de source : l'erreur peut être grande.",
    "proof-share-default": "Sans indication du style, l'apprêt est une part fixe des heures.",
    "starter-steps-by-hours": "La dose de levain baisse par paliers avec les heures, sans tenir compte de la température.",
    "starter-not-in-hydration": "La farine et l'eau du levain ne sont pas comptées dans l'hydratation.",
    "flour-at-kitchen-temp": "La farine est à la température de la cuisine.",
    "mixer-friction-values": "La chauffe du pétrin est une valeur type à vérifier ; à la main, elle est nulle.",
    "coefficients-not-measured": "Les coefficients de la formule sont choisis par le modèle, non mesurés.",
    "grade-is-not-strength": "Le type de farine indique le raffinage, pas la force : le W par type est une estimation.",
    "oven-temp-surface-unspecified": "Nous ne savons pas si la température déclarée est celle de l'air ou de la pierre.",
    "style-min-temp-no-source": "La température minimale du style n'a pas de source écrite.",
    "preheat-home-minutes": "La durée du préchauffage dépend seulement de la température du four, pas de la surface.",
    "rack-no-contact": "La grille n'a pas de surface de contact : la base cuit par rayonnement et par l'air.",
    "oven-power-steps": "Une puissance type par tranche de température, la même pour chaque combustible.",
    "no-health-claim": "Aucune allégation de santé : l'indice ne mesure pas la digestion d'une personne.",
    "thresholds-rules-of-thumb": "Les seuils sont des règles empiriques générales, non ajustées au style.",
  },
};
