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
  paramYeast: "Levure fraîche",
  detailFermentation: "Fermentation",
  detailFlavor: "Saveur",
  detailCrust: "Cro\u00FBte",
  detailExtensibility: "Extensibilit\u00E9",
  detailIdealStyles: "Styles id\u00E9aux",
  /* FW-05 */
  techniqueLabel: "Technique",
  recipeContextLine: "Dans cette recette : {yeast} de levure pour {flour} de farine du pré-ferment ({pct}). Toute la levure de la pâte va dans le pré-ferment ; elle est dosée sur la durée totale de la recette, pas seulement sur celle du pré-ferment.",
  compLabels: [
    "Hydratation",
    "Levure fraîche (sur la farine du pré-ferment)",
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
      fermentationType: "Plus rapide que la biga à levure égale : à la dose indiquée, il mûrit en 12–16 h",
      flavor: "Légèrement acidulé, notes de noisette",
      crustResult:
        "Fine et dorée ; couleur et taches dépendent du four et de la température",
      extensibility:
        "Élevée (estimation) : facile à étaler",
      tips: [
        "Prêt quand la surface est couverte de bulles et que le centre commence à s'affaisser",
        "Plus de levure, moins d'heures : à 20–22 °C, 0,1 % pour 15–16 h, 0,3 % pour 10–12 h",
        "Farine dans le poolish : 30–50 % de la farine totale ; {brand} part de {poolishFlourPct}",
      ],
    },
    biga: {
      origin: "Italie",
      description: "Pré-ferment ferme : farine, {bigaHydration} d'eau et environ 1 % de levure fraîche sur la farine de la biga, environ 16 h à 18–20 °C.",
      hydration: "{bigaHydration} (jusqu'à 50 % avec des farines complètes)",
      consistency: "S\u00E8che, compacte",
      fermentationType: "Lente : avec peu d'eau, elle mûrit en 16 h environ (jusqu'à 48 h avec le réfrigérateur)",
      flavor: "Aromatique, florale",
      crustResult: "Croustillante ; la structure dépend de l'hydratation et du façonnage",
      extensibility:
        "Dépend de la farine et de l'hydratation (à vérifier)",
      tips: [
        "Prête quand elle a gonflé par endroits, sent le yaourt et pétille un peu ; si elle a un goût acide, elle est allée trop loin",
        "Biga longue : 24 h à 4–5 °C, puis 24 h à 18–20 °C",
        "Farine dans la biga : en général 30–40 % de la farine totale ; {brand} part de {bigaFlourPct} et vous pouvez la modifier entre {flourPctMin} et {flourPctMax}",
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
      biga: "{bigaHydration}",
      poolish: "{poolishHydration}",
      autolisi: "= recette",
    },
    yeast: {
      biga: "1 %",
      poolish: "0,1–0,2 %",
      autolisi: "0%",
    },
    duration: {
      biga: "16 h (jusqu'à 48 h avec 24 h au réfrigérateur)",
      poolish: "12–16 h",
      autolisi: "20–60 min",
    },
    temperature: {
      biga: "18–20 °C (biga longue : d'abord 24 h à 4–5 °C)",
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
        cause: "Plus d'eau que la farine ne peut en absorber",
        testRapido: "L'hydratation de la recette dépasse-t-elle l'absorption indiquée sur la fiche de la farine ?",
        fixImmediate: "Ajoutez un peu de farine à la fois (2–3 %) et incorporez-la par rabats délicats",
        prevention: "Restez proche de l'absorption indiquée par le moulin ; si vous ne la connaissez pas, partez du bas de l'hydratation du style",
      },
      P02: {
        symptom:
          "La p\u00E2te se d\u00E9chire pendant l'\u00E9tirage",
        cause: "Gluten peu développé ou pas encore détendu, pâte encore froide du réfrigérateur ; parfois une farine peu extensible (P/L élevé) ou une pâte trop fermentée",
        testRapido: "Étirez doucement un bord : se déchire-t-il tout de suite au lieu de s'allonger ?",
        fixImmediate: "Couvrez le pâton et laissez-le reposer à température ambiante 30–60 min, puis réessayez",
        prevention: "Respectez les temps de la recette, sortez les pâtons du réfrigérateur à temps et utilisez une farine au P/L indiqué par le style",
      },
      P03: {
        symptom: "La p\u00E2te s'affaisse quand on la touche",
        cause: "Fermentation trop poussée : trop de temps, trop de chaleur ou trop de levure",
        testRapido: "Appuyez avec un doigt : si l'empreinte remonte tout de suite, elle n'est pas prête ; si elle remonte lentement, elle est prête ; si elle reste et que la pâte s'affaisse, elle est allée trop loin",
        fixImmediate: "Reboulez-la et laissez-la reprendre 1–2 h (elle aura moins d'alvéoles), ou étalez-la délicatement et enfournez aussitôt",
        prevention: "Contrôlez la pâte dès le dernier tiers du temps prévu, pas seulement la montre",
      },
      P04: {
        symptom: "La pâte ne lève pas dans le temps prévu",
        cause: "Levure peu active ou périmée, ou pâte plus froide que prévu. Au réfrigérateur, lever peu est normal",
        testRapido: "Était-elle au réfrigérateur ? C'est normal. Sinon, délayez une pincée de la levure dans de l'eau tiède avec un peu de sucre : mousse-t-elle après 10–15 min ?",
        fixImmediate: "Placez-la d'abord au chaud (24–28 °C) pendant 1–2 h. Si elle ne repart pas, la levure est inactive : refaites la pâte avec une levure neuve",
        prevention: "Vérifiez la date de péremption de la levure et la température de la pièce",
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
        cause: "Maturation trop longue ou trop chaude : les bactéries lactiques produisent des acides (plus souvent avec le levain)",
        testRapido: "Sentez et goûtez un petit morceau cru : l'acidité est-elle piquante, comme du vinaigre ?",
        fixImmediate: "Elle se mange ; la prochaine fois, raccourcissez la maturation à température ambiante",
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
        cause: "Grosses bulles restées dans le pâton et étalage très délicat",
        testRapido: "Les grosses bulles sont-elles réparties aussi au centre, pas seulement dans le bord ?",
        fixImmediate:
          "Presser l\u00E9g\u00E8rement le p\u00E2ton pour redistribuer le gaz",
        prevention: "Avant d'étaler, dégonflez délicatement les plus grosses bulles ; dans la napolitaine et la canotto, quelques grandes alvéoles dans le bord sont voulues",
      },
      P09: {
        symptom: "Base crue mais corniche br\u00FBl\u00E9e",
        cause:
          "D\u00E9s\u00E9quilibre thermique : trop de chaleur du haut, pas assez du bas",
        testRapido:
          "Contraste de couleur extr\u00EAme entre le dessus et le dessous ?",
        fixImmediate: "Cuisez plus près de la sole chaude et plus loin de la voûte ; si le four ne dépasse pas 300 °C, vous pouvez précuire la base 2–3 min sans garniture",
        prevention: "Équilibrez la chaleur : pierre ou acier bien préchauffés dessous, moins de chaleur par le haut",
      },
      P10: {
        symptom: "Cro\u00FBte p\u00E2le, pas de dorure",
        cause: "Four ou sole pas assez chauds pour le style, ou peu de sucres restants après une maturation très longue",
        testRapido: "Le four atteint-il la température du style ? La maturation a-t-elle été très longue ?",
        fixImmediate: "Utilisez le gril pendant les 1–2 dernières minutes, si le four en a un",
        prevention: "Poussez le four au maximum avec pierre ou acier bien préchauffés ; hors des recettes STG, qui n'admettent ni sucre ni malt, vous pouvez ajouter 0,5–1 % de sucre ou de malt",
      },
      P11: {
        symptom: "Pizza caoutchouteuse, pas croustillante",
        cause: "Cuisson trop courte ou trop basse pour l'épaisseur, ou plus d'eau que le style ne le prévoit",
        testRapido: "À la coupe, le cœur est-il encore humide et collant ?",
        fixImmediate: "Prolongez la cuisson de quelques minutes ; si le four a encore de la marge, montez la température",
        prevention: "Restez dans l'hydratation du style et cuisez le temps indiqué par la recette",
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
        cause: "Sole plus chaude que ce qu'il faut au style, ou farine ou semoule brûlée sur la pierre",
        testRapido: "Go\u00FBter : saveur am\u00E8re ?",
        fixImmediate:
          "Si amer = probl\u00E8me (baisser temp). Si savoureux = NORMAL",
        prevention: "Gardez la sole à la température du style et brossez la pierre entre deux pizzas",
      },
      P16: {
        symptom: "Corniche basse et plate",
        cause: "Dégazage excessif, farine trop faible pour le style ou usage du rouleau",
        testRapido: "Hauteur corniche <1cm ?",
        fixImmediate:
          "\u00C9tirage plus d\u00E9licat, ne pas \u00E9craser les bords",
        prevention: "Utilisez une farine de la force indiquée par le style et pas de rouleau pour les styles à bord",
      },
      P17: {
        symptom: "Pizza trop s\u00E8che",
        cause: "Moins d'eau que ne le prévoit le style, ou cuisson plus longue que le temps de la recette",
        testRapido: "L'hydratation et le temps de cuisson sont-ils ceux de la recette ?",
        fixImmediate: "Servez-la dès la sortie du four ; la prochaine fois, raccourcissez la cuisson",
        prevention: "Restez dans l'hydratation du style et ne dépassez pas le temps de cuisson indiqué",
      },
      P18: {
        symptom: "Centre de la pizza aqueux",
        cause: "Garniture trop liquide ou cuisson trop courte",
        testRapido:
          "Quantit\u00E9 de sauce par pizza ? Mozzarella tr\u00E8s humide ?",
        fixImmediate: "Précuisez la base 2–3 min, puis ajoutez la garniture",
        prevention:
          "Max 80ml sauce par pizza 30cm, bien \u00E9goutter la mozzarella",
      },
      P19: {
        symptom: "Impossible d'\u00E9taler le p\u00E2ton",
        cause: "Farine bien plus forte que ne le prévoit le style : pâte trop tenace",
        testRapido: "Le W de votre farine dépasse-t-il nettement celui du style ?",
        fixImmediate: "Laissez reposer le pâton couvert 20–30 min et réessayez ; dans la prochaine pâte, coupez la farine avec une plus faible",
        prevention: "Utilisez une farine de la force et du P/L indiqués par le style",
      },
      P20: {
        symptom: "Odeur « chimique » (alcool, solvant) dans la pâte",
        cause: "Fermentation trop poussée (alcool et esters) ou trop de levure ; plus rarement le chlore de l'eau",
        testRapido: "Odeur d'alcool ou d'acétone, et pâte molle qui ne remonte pas ?",
        fixImmediate: "Si elle est molle et ne remonte pas, traitez-la comme une pâte trop fermentée : reboulez-la ou enfournez-la aussitôt",
        prevention: "La prochaine fois, moins de levure ou un endroit plus frais. Si l'eau du robinet a un goût de chlore, prenez-en une autre : le repos à l'air n'élimine pas les chloramines",
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
        tip: "Ce style prévoit W {wMin}–{wMax} : utilisez une farine dans cette fourchette ou réduisez un peu l'hydratation",
      },
      high_pl: {
        message:
          "P/L {pl} \u00E9lev\u00E9 : possible p\u00E2te trop tenace",
        tip: "Pr\u00E9voir autolyse 45min avant sel et levure",
      },
      sour_risk: {
        message:
          "{h}h \u00E0 {t}\u00B0C : risque de saveur acide",
        tip: "Si votre cuisine est chaude, passez une partie de la maturation au réfrigérateur et surveillez la pâte plus que la montre",
      },
      pale_crust: {
        message:
          "Fermentation courte : vérifier le développement de la pâte avant de poursuivre.",
        tip: "Vérifier volume, élasticité et réaction à la pression : les heures seules ne prouvent pas la digestibilité.",
      },
      cold_oven: {
        message: "Four à {t} °C, sous la température du style : risque de croûte pâle et de pizza sèche",
        tip: "Préchauffez longuement la pierre ou l'acier et, si le four a un gril, utilisez-le pendant les dernières minutes",
      },
      beginner_hydration: {
        message:
          "Hydratation {h}% est exigeante pour les d\u00E9butants",
        tip: "Ce style prévoit {hMin}–{hMax} % : si vous débutez, restez près de {hMin} %",
      },
      high_w: {
        message: "W {w} bien au-dessus de celui du style : pâte difficile à étaler",
        tip: "Ce style prévoit W {wMin}–{wMax} : coupez avec une farine plus faible ou prévoyez une longue autolyse",
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
      whyImportant: "W décrit la force globale de la farine. La ténacité et l'extensibilité s'évaluent avec P, L et P/L : un W élevé ne signifie pas à lui seul une pâte plus tenace. Ces tranches sont celles que {brand} utilise dans toute l'application ; chaque style indique sa propre fourchette de W.",
      ranges: [
        { label: "Faible", value: "{wBandWeak}", note: "Farine tout usage ou pâtissière" },
        { label: "Moyenne", value: "{wBandMedium}", note: "Souvent vendue « pour pizza »" },
        { label: "Forte", value: "{wBandStrong}", note: "Longues maturations et pâtes très hydratées" },
        { label: "Très forte", value: "{wBandVeryStrong}", note: "Manitoba et farines pour grandes pâtes levées sucrées" },
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
      definition: "Le rapport entre la résistance de la pâte à la déformation et sa capacité à s’étirer.",
      whyImportant: "Décrit un équilibre rhéologique : la valeur adaptée dépend de la farine, de l'hydratation et de la méthode, et ne garantit ni la hauteur ni la texture de la pizza. Les exemples sont les fourchettes des styles de {brand} ; le P/L de votre farine figure sur la fiche technique du moulin.",
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
      formula: "H% = (poids de l'eau / poids de la farine) × 100",
      whyImportant: "Plus d'eau rend la pâte plus souple et plus difficile à travailler, et demande une farine plus forte. Le croustillant dépend surtout de la cuisson et de l'épaisseur : même une pizza en plaque très hydratée peut être croustillante. Les exemples sont les fourchettes des styles de {brand}.",
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
      whyImportant: "L'activité dépend de la souche, de la dose, de la température et de la pâte. Le froid ralentit la fermentation ; il n'existe pas de seuil universel d'arrêt immédiat. La bonne dose dépend des heures et de la température : la recette la calcule pour vous.",
      ranges: [
        { label: "Fraîche, {yeastS1Hours} à {yeastS1Temp}", value: "{yeastS1Pct}", note: "Estimation du modèle" },
        { label: "Fraîche, {yeastS2Hours} à {yeastS2Temp}", value: "{yeastS2Pct}", note: "Estimation du modèle" },
        { label: "Fraîche, {yeastS3Hours} à {yeastS3Temp}", value: "{yeastS3Pct}", note: "Estimation du modèle" },
        { label: "Fraîche, {yeastS4Hours} à {yeastS4Temp}", value: "{yeastS4Pct}", note: "Estimation du modèle" },
        { label: "Sèche (active ou instantanée)", value: "≈ fraîche × {yeastDryRatio}", note: "Même estimation que la fraîche" },
      ],
    },
    lab: {
      name: "LAB (Bact\u00E9ries lactiques)",
      definition: "Bact\u00E9ries qui fermentent les sucres en produisant de l'acide lactique (et ac\u00E9tique). Pr\u00E9sentes dans le levain.",
      whyImportant: "Ils peuvent modifier acidité et fructanes selon souches, farine et procédé. Leur présence ne certifie pas une pâte low FODMAP.",
    },
    q10: {
      name: "Q\u2081\u2080 (Coefficient de temp\u00E9rature)",
      definition: "Facteur multiplicatif de la vitesse de r\u00E9action biochimique pour chaque hausse de 10\u00B0C.",
      whyImportant: "Avec Q₁₀ = {q10ComAbove}, la vitesse est multipliée par {q10ComAbove} tous les {tenDegrees} : {q10ExampleRefHours} à {q10RefTemp} ≈ {q10ExampleWarmHours} à {q10ExampleWarmTemp}. Les valeurs de cette entrée sont des estimations du modèle de {brand}.",
      ranges: [
        { label: "Levure de boulanger ≥ {q10ComBreak}", value: "{q10ComAbove}", note: "Estimation du modèle, cohérente avec les données de croissance à température ambiante" },
        { label: "Levure de boulanger < {q10ComBreak}", value: "{q10ComBelow}", note: "Estimation du modèle, sans source" },
        { label: "Levain > {q10SdBreak}", value: "{q10SdAbove}", note: "Estimation du modèle" },
        { label: "Levain ≤ {q10SdBreak}", value: "{q10SdBelow}", note: "Estimation du modèle" },
      ],
    },
    arrhenius: {
      name: "\u00C9quation d'Arrhenius",
      definition: "Relie la vitesse d'une réaction à la température absolue (en kelvins) par une énergie d'activation.",
      formula: "k = A · e^(−Eₐ / (R · T)), avec T en kelvins",
      whyImportant: "{brand} n'utilise pas cette équation. Le moteur applique un Q₁₀ par paliers rapporté à {q10RefTemp} : {q10ComAbove} au-dessus et {q10ComBelow} en dessous de {q10ComBreak} pour la levure de boulanger, {q10SdAbove} au-dessus et {q10SdBelow} jusqu'à {q10SdBreak} pour le levain. Ce sont des estimations du modèle, pas des valeurs mesurées.",
    },
    biga: {
      name: "Biga",
      definition: "Pré-pâte ferme de farine, {bigaHydration} d'eau (jusqu'à 50 % avec des farines complètes) et environ 1 % de levure fraîche rapportée à la farine de la biga, maturée environ 16 h à 18–20 °C ; la biga longue passe 24 h à 4–5 °C puis 24 h à 18–20 °C.",
      whyImportant: "Apporte arôme et structure à la pâte finale. En général 30–40 % de la farine totale : {brand} part de {bigaFlourPct}. Non admise dans la napolitaine STG, qui se fait en direct.",
    },
    poolish: {
      name: "Poolish",
      definition: "Préferment liquide : farine et eau à parts égales avec peu de levure, mûri 12–16 h à 20–22 °C (0,1 % de levure pour 15–16 h, 0,3 % pour 10–12 h).",
      whyImportant: "Mûrit plus vite que la biga et rend la pâte extensible. En général 30–50 % de la farine totale : {brand} part de {poolishFlourPct}. Il est prêt quand la surface est couverte de bulles et que le centre commence à retomber.",
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
      whyImportant: "Plus k est élevé, plus la surface transmet vite la chaleur à la base : c'est pourquoi l'acier aide les fours domestiques, qui chauffent moins. Sur la sole, la chaleur que le matériau accumule compte aussi : les fours à bois utilisent de la brique réfractaire ou du biscotto.",
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
      whyImportant: "\u00C9lasticit\u00E9 due aux glut\u00E9nines (liaisons S-S), viscosit\u00E9 due aux gliadines (liaisons H). Une prot\u00E9olyse longue coupe les liaisons \u2192 p\u00E2te plus extensible.",
    },
    proteolysis: {
      name: "Prot\u00E9olyse",
      definition: "Les enzymes protéases décomposent les protéines de la pâte en molécules plus petites, comme les peptides et les acides aminés.",
      whyImportant: "Elle peut modifier l’extensibilité et la tenue de la pâte. Elle dépend de la farine, des micro-organismes, de la température et du procédé : aucune durée optimale universelle et aucune mesure de la digestibilité individuelle.",
    },
    thickness_factor: {
      name: "Thickness Factor (TF)",
      definition: "Quantité de pâte par unité de surface : les grammes de pâte pour chaque cm² de pizza.",
      formula: "TF = poids du pâton (g) / surface de la pizza (cm²)",
      whyImportant: "Mesure courante dans les calculateurs de pâte nord-américains (en oz/in² ; 1 oz/in² ≈ 4,39 g/cm²). {brand} l'exprime en g/cm² pour dimensionner les pâtons ; avec le four, elle oriente le temps de cuisson et le croustillant. Les exemples sont calculés à partir du poids du pâton et de la forme de chaque style.",
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
      name: "Temp\u00E9rature de l'eau (trois temp\u00E9ratures)",
      definition: "Calcule \u00E0 quelle temp\u00E9rature mettre l'eau pour que la p\u00E2te atteigne la temp\u00E9rature voulue.",
      formula: "T_eau = 3 × T_pâte − T_ambiante − T_farine − friction",
      whyImportant: "Somme des trois temp\u00E9ratures = 3 \u00D7 p\u00E2te voulue \u2212 \u00E9chauffement. En pizzeria on parle aussi de \u00AB r\u00E8gle du 55 \u00BB : avec une somme fixe de 55 la p\u00E2te arrive vers 18 \u00B0C (55 \u00F7 3) ; ici on utilise la cible du style, 22\u201324 \u00B0C.",
    },
    a_score: {
      name: "A-Score (Authenticit\u00E9)",
      definition: "Score de 0 à 100 sur la proximité avec le style de référence. Il ne certifie pas le respect d’un cahier des charges.",
      formula: "A = Ingrédients × {authWIngredients} + Procédé × {authWProcess} + Équipement × {authWEquipment}",
      ranges: [
        { label: "{aBand0}", value: "Rigoureusement authentique" },
        { label: "{aBand1}", value: "Fidèle avec adaptations" },
        { label: "{aBand2}", value: "Inspirée mais modifiée" },
        { label: "{aBand3}", value: "Librement interprétée" },
      ],
      whyImportant: "Les poids sont un choix de {brand}, pas une mesure. Règles du produit : sans le combustible prévu par le style, le score ne dépasse pas {authFuelCap} ; sous la température minimale du style, il diminue en proportion.",
    },
    f_score: {
      name: "F-Score (Facilité)",
      definition: "Score de 0 à 100 sur la facilité de préparation avec le four, la farine et l’expérience disponibles. Les conditions qui bloquent une recette sont évaluées à part.",
      formula: "F = Four × {feasWOven} + Farine × {feasWFlour} + Expérience × {feasWSkill}",
      ranges: [
        { label: "{fBand0}", value: "Très faisable" },
        { label: "{fBand1}", value: "Faisable avec attention" },
        { label: "{fBand2}", value: "Difficile" },
        { label: "{fBand3}", value: "Risque élevé" },
      ],
      whyImportant: "Les poids sont un choix de {brand}, pas une mesure. Si la recette ne peut pas être réalisée avec votre cuisine, la compatibilité ne dépasse pas {nonFeasibleCeiling}, quels que soient les autres scores.",
    },
    d_score: {
      name: "D-Score (Maturation estimée)",
      definition: "Estimation du modèle selon le temps, la température, la levure et les préferments. Elle ne mesure pas la digestibilité individuelle et ne calcule pas les FODMAP.",
      ranges: [{"label":"{dBand0}","value":"Indice élevé"},{"label":"{dBand1}","value":"Indice moyen-élevé"},{"label":"{dBand2}","value":"Indice moyen"},{"label":"{dBand3}","value":"Indice faible"}],
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
      l2: "Nous multiplions les heures par la vitesse à votre température. Si vous fermentez plus au frais que la référence (réfrigérateur, cave), l'apprêt final et les plis avant le frigo se font à la température de référence : ces heures comptent telles quelles et seules les autres sont multipliées. C'est pourquoi « heures × vitesse » seul ne tombe pas juste.",
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
    /* FW-19: piano temporale. */
    "comfort-tolerances": {
      title: "Marges de la timeline confortable",
      l1: "Les marges avec lesquelles la timeline confortable déplace les attentes sont notre choix, pas une mesure.",
      l2: "Nous allongeons ou raccourcissons les attentes dans des marges fixes, plus larges au frigo qu'à température ambiante, sans déplacer d'heures du frigo vers la température ambiante et sans recalculer la levure. Plus vous vous éloignez du planning de départ, plus il faut vous fier au volume de la pâte.",
    },
    "bake-round-recovery": {
      title: "Remontée du four entre les cuissons",
      l1: "Le temps entre deux cuissons est une hypothèse du modèle.",
      l2: "Entre deux pizzas, on défourne, on enfourne et la sole remonte en température : un four domestique avec pierre a besoin de quelques minutes, un four à pizza de moins, un four à bois presque de rien. Nous utilisons une valeur fixe par type de four, non mesurée sur le vôtre.",
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
    "preferment-at-maturation-temp": "Avec un préferment, le préferment mûr est au milieu de sa température de maturation (biga 18–20 °C, poolish 20–22 °C) et son pétrissage à la main ne chauffe pas par friction.",
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
    /* FW-19: piano temporale. */
    "comfort-margins-rule-of-thumb": "Les marges, plus larges au frigo qu'à température ambiante, sont des règles pratiques sans source.",
    "comfort-yeast-unchanged": "La dose de levure reste celle calculée pour le planning de départ.",
    "recovery-by-oven-type": "La remontée dépend seulement du type de four, ni du modèle ni de la surface.",
  },
};
