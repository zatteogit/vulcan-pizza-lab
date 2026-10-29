/* === DOMAIN DATA i18n — Español === */
import type {
  CmsPreFerment,
  CmsTroubleshootingI18n,
  CmsGlossaryTerms,
  CmsScience,
} from "../cms-context";

export const PRE_FERMENT_ES: Partial<CmsPreFerment> = {
  sectionLabel: "Prefermento",
  tipsLabel: "Consejos",
  showComparison: "Comparar Biga vs Poolish vs Autólisis",
  paramHydration: "Hidratación",
  paramDuration: "Duración",
  paramTemperature: "Temperatura",
  paramYeast: "Levadura fresca",
  detailFermentation: "Fermentación",
  detailFlavor: "Sabor",
  detailCrust: "Corteza",
  detailExtensibility: "Extensibilidad",
  detailIdealStyles: "Estilos ideales",
  /* FW-05 */
  techniqueLabel: "Técnica",
  recipeContextLine: "En esta receta: {yeast} de levadura sobre {flour} de harina del prefermento ({pct}). Toda la levadura de la masa va al prefermento y se dosifica según las horas totales de la receta, no solo las del prefermento.",
  compLabels: [
    "Hidratación",
    "Levadura fresca (sobre la harina del prefermento)",
    "Duración",
    "Temperatura",
    "Sabor",
    "Extensibilidad",
  ],
  items: {
    poolish: {
      origin: "Polonia, después Francia",
      description:
        "Prefermento líquido: harina y agua a partes iguales con poca levadura, 12–16 h a 20–22 °C.",
      hydration: "100 % (harina y agua a partes iguales)",
      consistency: "Líquida, espumosa",
      fermentationType: "Más rápido que la biga con la misma levadura: con la dosis indicada madura en 12–16 h",
      flavor: "Ligeramente ácido, notas de avellana",
      crustResult:
        "Fina y dorada; el color y las manchas dependen del horno y la temperatura",
      extensibility: "Alta (estimación): fácil de estirar",
      tips: [
        "Listo cuando la superficie está llena de burbujas y el centro empieza a hundirse",
        "Más levadura, menos horas: a 20–22 °C, 0,1 % para 15–16 h, 0,3 % para 10–12 h",
        "Harina en el poolish: 30–50 % de la harina total; {brand} parte del {poolishFlourPct}",
      ],
    },
    biga: {
      origin: "Italia",
      description: "Prefermento firme: harina, {bigaHydration} de agua y alrededor del 1 % de levadura fresca sobre la harina de la biga, unas 16 h a 18–20 °C.",
      hydration: "{bigaHydration} (hasta 50 % con harinas integrales)",
      consistency: "Seca, compacta",
      fermentationType: "Lenta: con poca agua madura en unas 16 h (hasta 48 h con nevera)",
      flavor: "Aromático, floral",
      crustResult: "Crujiente; la estructura depende de la hidratación y el estirado",
      extensibility: "Depende de la harina y la hidratación (por verificar)",
      tips: [
        "Lista cuando está hinchada a trozos, huele a yogur y burbujea un poco; si sabe ácida, se ha pasado",
        "Biga larga: 24 h a 4–5 °C y luego 24 h a 18–20 °C",
        "Harina en la biga: suele ser el 30–40 % de la harina total; {brand} parte del {bigaFlourPct} y puedes cambiarla entre el {flourPctMin} y el {flourPctMax}",
        "No se usa en la Napolitana ETG: el pliego solo admite el método directo",
      ],
    },
    autolisi: {
      origin: "R. Calvel, Francia 1974",
      description:
        "No es un prefermento: harina y agua reposan sin levadura ni sal antes de amasar.",
      hydration: "La de la receta (a menudo se reserva un poco de agua)",
      consistency: "Pastosa",
      fermentationType: "Ninguna (solo actividad enzimática)",
      flavor: "Neutro — no altera el sabor",
      crustResult: "Variable — depende del proceso posterior",
      extensibility: "Alta — masa sedosa y menos pegajosa",
      idealStyles: "Todos los estilos (técnica universal)",
      tips: [
        "Reposo de 20–60 minutos; la levadura y la sal se añaden después",
        "Se combina con biga o poolish",
      ],
    },
  },
  compValues: {
    hydration: {
      biga: "{bigaHydration}",
      poolish: "{poolishHydration}",
      autolisi: "= receta",
    },
    yeast: {
      biga: "1 %",
      poolish: "0,1–0,2 %",
      autolisi: "0%",
    },
    duration: {
      biga: "16 h (hasta 48 h con 24 h en nevera)",
      poolish: "12–16 h",
      autolisi: "20–60 min",
    },
    temperature: {
      biga: "18–20 °C (biga larga: primero 24 h a 4–5 °C)",
      poolish: "20–22 °C",
      autolisi: "Ambiente",
    },
    flavor: {
      biga: "Aromático",
      poolish: "Ligeramente ácido",
      autolisi: "Neutro",
    },
    extensibility: {
      biga: "Variable",
      poolish: "Alta (estimación)",
      autolisi: "Alta",
    },
  },
};



export const TROUBLESHOOTING_ES: Partial<CmsTroubleshootingI18n> =
  {
    categories: {
      frying: "Fritura",
      dough: "Masa",
      fermentation: "Fermentación",
      shaping: "Formado",
      baking: "Cocción",
      solver: "Algoritmo",
      false_positive: "Falsas alarmas",
    },
    issues: {
      FR01: {
        symptom: "Dorada por fuera, cruda por dentro",
        cause: "Aceite demasiado caliente o masa demasiado gruesa.",
        testRapido: "Abre una pieza de prueba y comprueba el centro.",
        fixImmediate: "Baja el fuego para las siguientes piezas; no te guíes solo por el color.",
        prevention: "Usa un termómetro y respeta la temperatura de aceite de la receta.",
      },
      FR02: {
        symptom: "Grasienta y poco crujiente",
        cause: "Aceite demasiado frío o enfriado por demasiadas piezas juntas.",
        testRapido: "Comprueba la temperatura entre tandas.",
        fixImmediate: "Deja que el aceite recupere la temperatura prevista; fríe pocas piezas y escurre bien.",
        prevention: "No sobrecargues el recipiente y controla la temperatura durante la fritura.",
      },
      FR03: {
        symptom: "El relleno sale al aceite",
        cause: "Bordes mal sellados, agujeros o relleno en los bordes.",
        testRapido: "Comprueba el cierre de las piezas aún crudas.",
        fixImmediate: "Sella mejor las siguientes piezas; nunca añadas agua al aceite caliente.",
        prevention: "Mantén limpios los bordes, dosifica el relleno y cierra sin perforar la masa.",
      },

      P01: {
        symptom: "Masa pegajosa persistente",
        cause: "Más agua de la que la harina puede absorber",
        testRapido: "¿La hidratación de la receta supera la absorción indicada en la ficha de la harina?",
        fixImmediate: "Añade poca harina cada vez (2–3 %) e incorpórala con pliegues suaves",
        prevention: "Quédate cerca de la absorción que declara el molino; si no la conoces, empieza por la parte baja de la hidratación del estilo",
      },
      P02: {
        symptom: "La masa se rompe al estirar",
        cause: "Gluten poco desarrollado o todavía no relajado, masa aún fría de la nevera; a veces una harina poco extensible (P/L alto) o una masa pasada de fermentación",
        testRapido: "Estira despacio un borde: ¿se rompe enseguida en lugar de alargarse?",
        fixImmediate: "Tapa el bollo y déjalo reposar a temperatura ambiente 30–60 min; luego vuelve a intentarlo",
        prevention: "Respeta los tiempos de la receta, saca los bollos de la nevera con tiempo y usa una harina con el P/L que indica el estilo",
      },
      P03: {
        symptom: "La masa colapsa al tocarla",
        cause: "Fermentación pasada: demasiado tiempo, demasiado calor o demasiada levadura",
        testRapido: "Presiona con un dedo: si la marca vuelve enseguida aún le falta, si vuelve despacio está lista, si se queda y la masa se hunde se ha pasado",
        fixImmediate: "Vuelve a bolear y déjala recuperarse 1–2 h (tendrá menos alveolos), o estírala con cuidado y hornéala enseguida",
        prevention: "Revisa la masa desde el último tercio del tiempo previsto, no solo el reloj",
      },
      P04: {
        symptom: "La masa no crece en el tiempo previsto",
        cause: "Levadura poco activa o caducada, o masa más fría de lo previsto. En la nevera es normal que crezca poco",
        testRapido: "¿Estaba en la nevera? Es normal. Si no, disuelve una pizca de la levadura en agua tibia con un poco de azúcar: ¿hace espuma a los 10–15 min?",
        fixImmediate: "Primero ponla en un sitio cálido (24–28 °C) durante 1–2 h. Si no se reactiva, la levadura está inactiva: rehaz la masa con levadura nueva",
        prevention: "Comprueba la caducidad de la levadura y la temperatura de la habitación",
      },
      P05: {
        symptom: "Levado demasiado rápido (dobla en <3h)",
        cause:
          "Demasiada levadura (>1.5%) o temperatura ambiente >28°C",
        testRapido: "¿La masa ha doblado en menos de 3 horas?",
        fixImmediate:
          "Refrigera la masa para ralentizar la fermentación; el frío no la detiene de inmediato.",
        prevention:
          "Usa la dosis de levadura calculada para tus horas y tu temperatura (a 18 °C durante 24 h, cerca del 0,1 % de levadura fresca)",
      },
      P06: {
        symptom: "Sabor demasiado ácido/acético",
        cause: "Maduración demasiado larga o demasiado cálida: las bacterias lácticas producen ácidos (pasa más con masa madre)",
        testRapido: "Huele y prueba un trocito crudo: ¿la acidez es punzante, como de vinagre?",
        fixImmediate: "Se puede comer; la próxima vez acorta la maduración a temperatura ambiente",
        prevention: "Elige tiempo, temperatura y levadura según el método; no hay un umbral horario universal.",
      },
      P07: {
        symptom:
          "La bola vuelve elástica tras estirar ('efecto muelle')",
        cause: "Gluten no suficientemente relajado",
        testRapido:
          "Estira a 30cm — ¿vuelve a 25cm tras 30 segundos?",
        fixImmediate:
          "Reposo adicional 15min cubierto, estirado en 2 fases",
        prevention:
          "Saca las bolas del frigo 60-90min antes de estirar",
      },
      P08: {
        symptom: "Agujeros gigantes irregulares en la pizza",
        cause: "Burbujas grandes que quedaron en el bollo y un estirado muy delicado",
        testRapido: "¿Las burbujas grandes están repartidas también por el centro, no solo en el borde?",
        fixImmediate:
          "Presiona ligeramente la bola antes de estirar para redistribuir el gas",
        prevention: "Antes de estirar, desinfla con cuidado las burbujas más grandes; en la napolitana y en la canotto algunos alveolos grandes en el borde son buscados",
      },
      P09: {
        symptom: "Base cruda pero borde quemado",
        cause:
          "Desequilibrio térmico: mucho calor de arriba, poco de abajo",
        testRapido:
          "¿Contraste de color extremo entre arriba y abajo?",
        fixImmediate: "Hornea más cerca de la base caliente y más lejos de la bóveda; si el horno no pasa de 300 °C puedes precocer la base 2–3 min sin ingredientes",
        prevention: "Equilibra el calor: piedra o acero bien precalentados abajo, menos calor desde arriba",
      },
      P10: {
        symptom: "Corteza pálida, sin dorado",
        cause: "Horno o base poco calientes para el estilo, o pocos azúcares tras una maduración muy larga",
        testRapido: "¿El horno llega a la temperatura del estilo? ¿La maduración fue muy larga?",
        fixImmediate: "Usa el grill en los últimos 1–2 minutos, si el horno lo tiene",
        prevention: "Pon el horno al máximo con piedra o acero bien precalentados; fuera de las recetas STG, que no admiten azúcar ni malta, puedes añadir un 0,5–1 % de azúcar o malta",
      },
      P11: {
        symptom: "Pizza gomosa, no crujiente",
        cause: "Cocción demasiado corta o baja para el grosor, o más agua de la que prevé el estilo",
        testRapido: "Al cortarla, ¿el centro sigue húmedo y pegajoso?",
        fixImmediate: "Alarga la cocción unos minutos; si el horno aún tiene margen, sube la temperatura",
        prevention: "Quédate en la hidratación del estilo y hornea el tiempo que indica la receta",
      },
      P14: {
        symptom:
          "Manchas leopardo en el borde (leopard spotting)",
        cause:
          "Burbujas finas del borde que se oscurecen con el calor muy fuerte del horno (tostado y quemado localizados)",
        testRapido: "¿Las manchas son amargas al gusto?",
        fixImmediate:
          "¡NO es un problema! Es la característica deseada de la pizza napolitana",
        prevention:
          "Si muy marcadas: gira la pizza cada 20s durante cocción",
      },
      P15: {
        symptom: "Fondo de pizza oscuro/negro",
        cause: "Base más caliente de lo que necesita el estilo, o harina o sémola quemada sobre la piedra",
        testRapido: "Prueba: ¿sabor amargo?",
        fixImmediate:
          "Si amargo = problema (baja temp). Si sabroso = NORMAL",
        prevention: "Mantén la base a la temperatura del estilo y cepilla la piedra entre una pizza y otra",
      },
      P16: {
        symptom: "Borde bajo y plano",
        cause: "Desgasificado excesivo, harina demasiado floja para el estilo o uso del rodillo",
        testRapido: "¿Altura del borde <1cm?",
        fixImmediate:
          "Estirado más delicado, no aplastar los bordes",
        prevention: "Usa una harina con la fuerza que indica el estilo y nada de rodillo en los estilos con borde",
      },
      P17: {
        symptom: "Pizza demasiado seca",
        cause: "Menos agua de la que prevé el estilo o una cocción más larga que la de la receta",
        testRapido: "¿La hidratación y el tiempo de cocción son los de la receta?",
        fixImmediate: "Sírvela recién salida del horno; la próxima vez acorta la cocción",
        prevention: "Quédate en la hidratación del estilo y no superes el tiempo de cocción indicado",
      },
      P18: {
        symptom: "Centro de la pizza acuoso",
        cause:
          "Topping demasiado líquido o cocción demasiado corta",
        testRapido:
          "¿Cantidad de salsa por pizza? ¿Mozzarella muy húmeda?",
        fixImmediate: "Precuece la base 2–3 min y luego añade los ingredientes",
        prevention:
          "Máx 80ml salsa por pizza 30cm, escurre bien la mozzarella",
      },
      P19: {
        symptom: "Imposible estirar la bola",
        cause: "Harina mucho más fuerte de lo que prevé el estilo: masa demasiado tenaz",
        testRapido: "¿La W de tu harina supera con creces la del estilo?",
        fixImmediate: "Deja reposar el bollo tapado 20–30 min y vuelve a intentarlo; en la próxima masa corta la harina con una más floja",
        prevention: "Usa una harina con la fuerza y el P/L que indica el estilo",
      },
      P20: {
        symptom: "Olor «químico» (alcohol, disolvente) en la masa",
        cause: "Fermentación pasada (alcohol y ésteres) o demasiada levadura; más raramente el cloro del agua",
        testRapido: "¿Huele a alcohol o a acetona, y la masa está floja y no vuelve a subir?",
        fixImmediate: "Si está floja y no vuelve a subir, trátala como una masa pasada: vuelve a bolearla u hornéala enseguida",
        prevention: "La próxima vez, menos levadura o un sitio más fresco. Si el agua del grifo sabe a cloro, usa otra: dejarla reposar al aire no elimina las cloraminas",
      },
      P21: {
        symptom: "La fermentación cambia de una masa a otra (nevera de casa)",
        cause: "La nevera doméstica no mantiene una temperatura estable: descongelaciones, aperturas y baldas distintas hacen oscilar la maduración en frío, a diferencia de una cámara profesional",
        testRapido: "Mismo estilo, misma dosis de levadura: ¿el levado cambia mucho de una vez a otra?",
        fixImmediate: "Pon la masa en la balda más baja/central (la más estable) y valora el bollo a ojo, no solo por el reloj",
        prevention: "Mide la temperatura del estante usado y observa la masa. El azúcar no corrige las oscilaciones del frigorífico.",
      },
    },
    contextual: {
      sticky_dough: {
        message:
          "Hidratación {h}% con W {w}: riesgo de masa pegajosa",
        tip: "Este estilo prevé W {wMin}–{wMax}: usa una harina en esa horquilla o baja un poco la hidratación",
      },
      high_pl: {
        message: "P/L {pl} alto: posible masa demasiado tenaz",
        tip: "Planifica autólisis 45min antes de añadir sal y levadura",
      },
      sour_risk: {
        message: "{h}h a {t}°C: riesgo de sabor ácido",
        tip: "Si tu cocina está caliente, pasa parte de la maduración a la nevera y vigila la masa más que el reloj",
      },
      pale_crust: {
        message:
          "Fermentación breve: comprueba el desarrollo de la masa antes de seguir.",
        tip: "Comprueba el volumen, la elasticidad y la respuesta a la presión: las horas no acreditan la digestibilidad.",
      },
      cold_oven: {
        message: "Horno a {t} °C, por debajo de la temperatura del estilo: riesgo de corteza pálida y pizza seca",
        tip: "Precalienta bien la piedra o el acero y, si el horno tiene grill, úsalo en los últimos minutos",
      },
      beginner_hydration: {
        message:
          "Hidratación {h}% es exigente para principiantes",
        tip: "Este estilo prevé {hMin}–{hMax} %: si estás empezando, quédate cerca del {hMin} %",
      },
      high_w: {
        message: "W {w} muy por encima de la del estilo: masa difícil de estirar",
        tip: "Este estilo prevé W {wMin}–{wMax}: córtala con una harina más floja o prevé una autólisis larga",
      },
      flat_long_ferment: {
        message:
          "{h}h en nevera sin prefermento: posible sabor plano",
        tip: "Añade un prefermento (poolish o biga) para complejidad aromática",
      },
    },
  };

export const GLOSSARY_TERMS_ES: Partial<CmsGlossaryTerms> = {
  terms: {
    w_alveograph: {
      name: "W (Alve\u00F3grafo de Chopin)",
      definition: "Energ\u00EDa total necesaria para expandir un alveolo de masa hasta su rotura. Mide la fuerza global de la harina.",
      whyImportant: "W describe la fuerza global de la harina. La tenacidad y la extensibilidad se valoran con P, L y P/L: una W alta no implica por sí sola una masa más tenaz. Estas franjas son las que {brand} usa en toda la app; cada estilo indica su propia horquilla de W.",
      ranges: [
        { label: "Débil", value: "{wBandWeak}", note: "Harina de uso general o de repostería" },
        { label: "Media", value: "{wBandMedium}", note: "A menudo vendida «para pizza»" },
        { label: "Fuerte", value: "{wBandStrong}", note: "Maduraciones largas y masas muy hidratadas" },
        { label: "Muy fuerte", value: "{wBandVeryStrong}", note: "Manitoba y harinas para grandes masas dulces fermentadas" },
      ],
    },
    p_tenacity: {
      name: "P (Tenacidad)",
      definition: "Resistencia m\u00E1xima a la deformaci\u00F3n. Pico de la curva alveogr\u00E1fica \u2014 cu\u00E1nto resiste la masa al estiramiento.",
      whyImportant: "P alto: masa \u00ABdura\u00BB, mantiene la forma en la cocci\u00F3n. P bajo: masa \u00ABblanda\u00BB, f\u00E1cil de estirar, puede colapsar.",
      ranges: [
        { label: "Pizza", value: "40\u201380 mm" },
        { label: "Pan", value: "80\u2013120 mm" },
        { label: "Cruas\u00E1n", value: "100\u2013140 mm" },
      ],
    },
    l_extensibility: {
      name: "L (Extensibilidad)",
      definition: "Longitud m\u00E1xima que alcanza el alveolo antes de romperse. Mide cu\u00E1nto se puede alargar la masa.",
      whyImportant: "L alto: masa extensible, f\u00E1cil de estirar sin desgarros. L bajo: masa corta, se rompe.",
      ranges: [
        { label: "Pizza", value: "80\u2013120 mm" },
        { label: "Pan", value: "60\u2013100 mm" },
      ],
    },
    pl_ratio: {
      name: "P/L (Relaci\u00F3n Tenacidad/Extensibilidad)",
      definition: "La relación entre la resistencia de la masa a deformarse y su capacidad para estirarse.",
      whyImportant: "Describe un equilibrio reológico: el valor adecuado depende de la harina, la hidratación y el método, y no garantiza la altura ni la textura de la pizza. Los ejemplos son las horquillas de los estilos de {brand}; el P/L de tu harina está en la ficha técnica del molino.",
    },
    falling_number: {
      name: "Falling Number (Hagberg-Perten)",
      definition: "Tiempo que tarda un v\u00E1stago en caer a trav\u00E9s de una suspensi\u00F3n de harina calentada. Mide la actividad amil\u00E1sica.",
      whyImportant: "FN bajo (<250): fermentaci\u00F3n r\u00E1pida pero masa inestable. FN alto (>300): estable para maduraciones largas.",
      ranges: [
        { label: "<200 Amilasa alt\u00EDsima", value: "Masa pegajosa", note: "Desaconsejado para pizza" },
        { label: "200\u2013250 Alta", value: "Miga h\u00FAmeda", note: "Pan r\u00E1pido" },
        { label: "250\u2013300 Media", value: "Buen equilibrio", note: "Pizza 8-12h" },
        { label: "300\u2013400 Baja", value: "Seca, lenta", note: "Pizza 24-48h" },
        { label: ">400 Muy baja", value: "Seca", note: "Pasta seca" },
      ],
    },
    hydration: {
      name: "Hidrataci\u00F3n (H%)",
      definition: "Porcentaje en peso de agua respecto a la harina en la masa.",
      formula: "H% = (peso del agua / peso de la harina) × 100",
      whyImportant: "Más agua hace la masa más blanda y más difícil de manejar, y pide una harina más fuerte. Lo crujiente depende sobre todo de la cocción y del grosor: incluso una pizza en bandeja muy hidratada puede quedar crujiente. Los ejemplos son las horquillas de los estilos de {brand}.",
    },
    absorption: {
      name: "Absorci\u00F3n de agua",
      definition: "Cantidad m\u00E1xima de agua que puede absorber una harina manteniendo una consistencia manejable. Depende de las prote\u00EDnas, el almid\u00F3n da\u00F1ado y la fibra.",
      ranges: [
        { label: "00 floja (W150)", value: "50\u201352%" },
        { label: "00 media (W220)", value: "53\u201355%" },
        { label: "00 fuerte (W280)", value: "56\u201358%" },
        { label: "Integral", value: "65\u201375%" },
        { label: "Manitoba (W380)", value: "60\u201365%" },
      ],
    },
    stability: {
      name: "Estabilidad de la masa",
      definition: "Cuánto tiempo mantiene la masa su consistencia durante el amasado. Se mide con el farinógrafo.",
      whyImportant: "Estabilidad baja (<5 min): se degrada si se sobreamasa. Alta (>10 min): tolera errores de manejo.",
      ranges: [
        { label: "Floja", value: "2\u20134 min" },
        { label: "Media", value: "5\u20138 min" },
        { label: "Fuerte", value: "10\u201315 min" },
        { label: "Manitoba", value: "15\u201320 min" },
      ],
    },
    yeast: {
      name: "Levadura (Saccharomyces cerevisiae)",
      definition: "Un hongo unicelular que fermenta los azúcares y produce dióxido de carbono, alcohol y compuestos aromáticos.",
      whyImportant: "La actividad depende de la cepa, la dosis, la temperatura y la masa. El frío ralentiza la fermentación; no existe un umbral universal de parada inmediata. La dosis correcta depende de las horas y de la temperatura: la receta la calcula por ti.",
      ranges: [
        { label: "Fresca, {yeastS1Hours} a {yeastS1Temp}", value: "{yeastS1Pct}", note: "Estimación del modelo" },
        { label: "Fresca, {yeastS2Hours} a {yeastS2Temp}", value: "{yeastS2Pct}", note: "Estimación del modelo" },
        { label: "Fresca, {yeastS3Hours} a {yeastS3Temp}", value: "{yeastS3Pct}", note: "Estimación del modelo" },
        { label: "Fresca, {yeastS4Hours} a {yeastS4Temp}", value: "{yeastS4Pct}", note: "Estimación del modelo" },
        { label: "Seca (activa o instantánea)", value: "≈ fresca × {yeastDryRatio}", note: "Misma estimación que la fresca" },
      ],
    },
    lab: {
      name: "LAB (Bacterias l\u00E1cticas)",
      definition: "Bacterias que fermentan az\u00FAcares produciendo \u00E1cido l\u00E1ctico (y ac\u00E9tico). Presentes en la masa madre.",
      whyImportant: "Pueden modificar acidez y fructanos según cepas, harina y proceso. Su presencia no certifica una masa low FODMAP.",
    },
    q10: {
      name: "Q\u2081\u2080 (Coeficiente de temperatura)",
      definition: "Factor multiplicador de la velocidad de reacci\u00F3n bioqu\u00EDmica por cada aumento de 10\u00B0C.",
      whyImportant: "Con Q₁₀ = {q10ComAbove} la velocidad se multiplica por {q10ComAbove} cada {tenDegrees}: {q10ExampleRefHours} a {q10RefTemp} ≈ {q10ExampleWarmHours} a {q10ExampleWarmTemp}. Los valores de esta entrada son estimaciones del modelo de {brand}.",
      ranges: [
        { label: "Levadura comercial ≥ {q10ComBreak}", value: "{q10ComAbove}", note: "Estimación del modelo, coherente con los datos de crecimiento a temperatura ambiente" },
        { label: "Levadura comercial < {q10ComBreak}", value: "{q10ComBelow}", note: "Estimación del modelo, sin fuente" },
        { label: "Masa madre > {q10SdBreak}", value: "{q10SdAbove}", note: "Estimación del modelo" },
        { label: "Masa madre ≤ {q10SdBreak}", value: "{q10SdBelow}", note: "Estimación del modelo" },
      ],
    },
    arrhenius: {
      name: "Ecuaci\u00F3n de Arrhenius",
      definition: "Relaciona la velocidad de una reacción con la temperatura absoluta (en kelvin) mediante una energía de activación.",
      formula: "k = A · e^(−Eₐ / (R · T)), con T en kelvin",
      whyImportant: "{brand} no usa esta ecuación. El motor aplica un Q₁₀ por tramos referido a {q10RefTemp}: {q10ComAbove} por encima y {q10ComBelow} por debajo de {q10ComBreak} para la levadura comercial, {q10SdAbove} por encima y {q10SdBelow} hasta {q10SdBreak} para la masa madre. Son estimaciones del modelo, no valores medidos.",
    },
    biga: {
      name: "Biga",
      definition: "Prefermento firme de harina, {bigaHydration} de agua (hasta el 50 % con harinas integrales) y alrededor del 1 % de levadura fresca sobre la harina de la biga, madurado unas 16 h a 18–20 °C; la biga larga pasa 24 h a 4–5 °C y luego 24 h a 18–20 °C.",
      whyImportant: "Aporta aroma y estructura a la masa final. Suele ser el 30–40 % de la harina total: {brand} parte del {bigaFlourPct}. No se admite en la napolitana STG, que es de masa directa.",
    },
    poolish: {
      name: "Poolish",
      definition: "Prefermento líquido: harina y agua a partes iguales con poca levadura, madurado 12–16 h a 20–22 °C (0,1 % de levadura para 15–16 h, 0,3 % para 10–12 h).",
      whyImportant: "Madura más rápido que la biga y hace la masa extensible. Suele ser el 30–50 % de la harina total: {brand} parte del {poolishFlourPct}. Está listo cuando la superficie está llena de burbujas y el centro empieza a ceder.",
    },
    autolysis: {
      name: "Aut\u00F3lisis",
      definition: "Reposo de harina y agua, sin levadura ni sal, durante 20–60 minutos antes de amasar (R. Calvel, 1974). No es un prefermento.",
      whyImportant: "La masa se vuelve más extensible y más fácil de trabajar.",
    },
    bulk_fermentation: {
      name: "Fermentaci\u00F3n en bloque (puntata)",
      definition: "Primera fermentación, en bloque, después del amasado y antes de bolear. Según el estilo dura desde menos de una hora hasta más de un día en la nevera: la duración correcta es la del procedimiento.",
      whyImportant: "El gluten se relaja, empieza la fermentación y la masa gana aroma.",
    },
    ball_fermentation: {
      name: "Fermentaci\u00F3n final (appretto)",
      definition: "Segunda fermentación, después de bolear: en bolas o, en los estilos de bandeja, directamente en la bandeja. Dura según estilo, temperatura y levadura: la duración correcta es la del procedimiento.",
      whyImportant: "Lleva las bolas al volumen adecuado para estirar y hornear.",
    },
    maillard: {
      name: "Reacci\u00F3n de Maillard",
      definition: "Conjunto de reacciones no enzimáticas entre compuestos amino y azúcares reductores, favorecidas por el calentamiento.",
      whyImportant: "Contribuye al color y al aroma de la corteza. Su intensidad y velocidad dependen de la temperatura superficial, el tiempo, la humedad y los ingredientes; la temperatura del horno no es la del alimento.",
    },
    caramelization: {
      name: "Caramelizaci\u00F3n",
      definition: "Transformaciones de los azúcares durante el calentamiento, distintas de Maillard y sin requerir compuestos amino.",
      whyImportant: "Puede contribuir al color y a los aromas tostados. Depende de los azúcares presentes, la humedad, el tiempo y la temperatura superficial.",
    },
    starch_gelatinization: {
      name: "Gelatinizaci\u00F3n del almid\u00F3n",
      definition: "Con agua y calor, los gránulos de almidón se hidratan, se hinchan y pierden parte de su estructura cristalina. El intervalo depende del almidón y de la formulación.",
      whyImportant: "Contribuye a la estructura de la miga y a la transformación del almidón. Una sola temperatura central no certifica la cocción completa ni la digestibilidad individual.",
    },
    retrogradation: {
      name: "Retrogradaci\u00F3n",
      definition: "Recristalizaci\u00F3n del almid\u00F3n gelatinizado durante la conservaci\u00F3n. M\u00E1xima a 4\u00B0C (nevera).",
      whyImportant: "La miga se endurece y queda \u00ABrevenida\u00BB. Se retrasa con: grasas 2-3%, az\u00FAcares 1-2%, fermentaci\u00F3n larga, hidrataci\u00F3n alta.",
    },
    thermal_conductivity: {
      name: "Conductividad t\u00E9rmica",
      definition: "Capacidad de un material para conducir el calor.",
      whyImportant: "Cuanto mayor es k, más rápido pasa la superficie el calor a la base: por eso el acero ayuda a los hornos domésticos, que calientan menos. En la base del horno también cuenta cuánto calor acumula el material: los hornos de leña usan ladrillo refractario o biscotto.",
      ranges: [
        { label: "Cobre", value: "400" },
        { label: "Aluminio", value: "205" },
        { label: "Acero al carbono", value: "50" },
        { label: "Acero inoxidable", value: "16" },
        { label: "Cordierita (piedra)", value: "2.5\u20133.5" },
        { label: "Piedra refractaria", value: "1.0\u20131.5" },
        { label: "Masa de pizza", value: "0.5" },
      ],
    },
    fodmap: {
      name: "FODMAP",
      definition: "Fermentable Oligosaccharides, Disaccharides, Monosaccharides And Polyols (oligosac\u00E1ridos, disac\u00E1ridos, monosac\u00E1ridos y polioles fermentables). Carbohidratos de cadena corta fermentables (fructanos 1-3% en el trigo).",
      whyImportant: "La fermentación puede modificar los FODMAP, pero el resultado depende de la harina, los microorganismos, el proceso y la porción. Las horas por sí solas no permiten cuantificar una reducción ni clasificar la receta como baja en FODMAP.",
    },
    histamine: {
      name: "Histamina",
      definition: "Amina bi\u00F3gena procedente de la descarboxilaci\u00F3n de la histidina. La producen las LAB durante la fermentaci\u00F3n; presente en quesos curados y embutidos.",
      whyImportant: "El contenido depende de microorganismos, ingredientes, proceso y conservación. No se calcula con una tasa fija por hora; una fermentación breve no garantiza su ausencia.",
    },
    gluten: {
      name: "Gluten",
      definition: "La gliadina y la glutenina forman, con agua y amasado, una red elástica y extensible en la masa.",
      whyImportant: "Elasticidad gracias a las gluteninas (enlaces S-S), viscosidad gracias a las gliadinas (enlaces H). Una prote\u00F3lisis larga rompe enlaces \u2192 masa m\u00E1s extensible.",
    },
    proteolysis: {
      name: "Prote\u00F3lisis",
      definition: "Las enzimas proteasas descomponen las proteínas de la masa en moléculas más pequeñas, como péptidos y aminoácidos.",
      whyImportant: "Puede modificar la extensibilidad y la resistencia de la masa. Depende de la harina, los microorganismos, la temperatura y el proceso: no existe una duración óptima universal ni mide la digestibilidad individual.",
    },
    thickness_factor: {
      name: "Thickness Factor (TF, factor de grosor)",
      definition: "Cantidad de masa por unidad de superficie: los gramos de masa por cada cm² de pizza.",
      formula: "TF = peso del bollo (g) / área de la pizza (cm²)",
      whyImportant: "Métrica habitual en las calculadoras de masa norteamericanas (en oz/in²; 1 oz/in² ≈ 4,39 g/cm²). {brand} la expresa en g/cm² para dimensionar los bollos; junto con el horno orienta el tiempo de cocción y lo crujiente. Los ejemplos se calculan a partir del peso del bollo y la forma de cada estilo.",
    },
    friction_factor: {
      name: "Fricci\u00F3n de la amasadora",
      definition: "Grados que la amasadora a\u00F1ade a la masa mientras trabaja.",
      whyImportant: "Amasar calienta la masa y adelanta la fermentaci\u00F3n: por eso el agua debe estar m\u00E1s fr\u00EDa cuando usas una m\u00E1quina.",
      ranges: [
        { label: "A mano", value: "0" },
        { label: "Amasadora de horquilla", value: "2" },
        { label: "Espiral", value: "3" },
        { label: "Batidora planetaria dom\u00E9stica (masas de cocina)", value: "4" },
        { label: "Planetaria", value: "5" },
      ],
    },
    rule_of_55: {
      name: "Temperatura del agua (tres temperaturas)",
      definition: "Calcula a qu\u00E9 temperatura poner el agua para que la masa llegue a la temperatura deseada.",
      formula: "T_agua = 3 × T_masa − T_ambiente − T_harina − fricción",
      whyImportant: "Suma de las tres temperaturas = 3 \u00D7 masa deseada \u2212 fricci\u00F3n. En pizzer\u00EDa tambi\u00E9n se llama \u00ABregla del 55\u00BB: con la suma fija en 55 la masa queda en torno a 18 \u00B0C (55 \u00F7 3); aquí se usa la temperatura objetivo del estilo, 22\u201324 \u00B0C.",
    },
    a_score: {
      name: "A-Score (Autenticidad)",
      definition: "Puntuación de 0 a 100 sobre la cercanía a la referencia del estilo. No certifica el cumplimiento de un pliego.",
      formula: "A = Ingredientes × {authWIngredients} + Proceso × {authWProcess} + Equipo × {authWEquipment}",
      ranges: [
        { label: "{aBand0}", value: "Rigurosamente auténtica" },
        { label: "{aBand1}", value: "Fiel con adaptaciones" },
        { label: "{aBand2}", value: "Inspirada pero modificada" },
        { label: "{aBand3}", value: "Libremente interpretada" },
      ],
      whyImportant: "Los pesos son una elección de {brand}, no una medida. Reglas del producto: sin el combustible que pide el estilo, la puntuación no supera {authFuelCap}; por debajo de la temperatura mínima del estilo se reduce en proporción.",
    },
    f_score: {
      name: "F-Score (Facilidad)",
      definition: "Puntuación de 0 a 100 sobre la facilidad de preparación con el horno, harina y experiencia disponibles. Los requisitos que bloquean la receta se evalúan aparte.",
      formula: "F = Horno × {feasWOven} + Harina × {feasWFlour} + Experiencia × {feasWSkill}",
      ranges: [
        { label: "{fBand0}", value: "Muy factible" },
        { label: "{fBand1}", value: "Factible con atención" },
        { label: "{fBand2}", value: "Difícil" },
        { label: "{fBand3}", value: "Riesgo alto" },
      ],
      whyImportant: "Los pesos son una elección de {brand}, no una medida. Si la receta no se puede hacer con tu cocina, la compatibilidad no supera {nonFeasibleCeiling}, sean cuales sean las otras puntuaciones.",
    },
    d_score: {
      name: "D-Score (Maduración estimada)",
      definition: "Estimación del modelo basada en tiempo, temperatura, levadura y prefermentos. No mide la digestibilidad individual ni calcula los FODMAP.",
      ranges: [{"label":"{dBand0}","value":"Índice alto"},{"label":"{dBand1}","value":"Índice medio-alto"},{"label":"{dBand2}","value":"Índice medio"},{"label":"{dBand3}","value":"Índice bajo"}],
    },
  },
};
/* FW-01 — Registro científico: textos de notas e hipótesis (claves como SCIENCE_I18N_DEFAULTS). */
export const SCIENCE_ES: CmsScience = {
  notes: {
    "yeast-dose": {
      title: "Dosis de levadura",
      l1: "Es una estimación: más horas y más calor piden menos levadura.",
      l2: "Partimos de una dosis de referencia coherente con los reglamentos napolitanos y la ajustamos a tus horas y tu temperatura. La levadura, la harina y la cocina reales pueden mover los tiempos: mira la masa más que el reloj.",
    },
    "q10-fermentation": {
      title: "Temperatura y velocidad de fermentación",
      l1: "Más calor, fermentación más rápida; más frío, más lenta. El factor es una estimación.",
      l2: "El modelo usa un factor de velocidad por tramos respecto a una temperatura de referencia. A temperatura ambiente coincide con los estudios sobre levadura; en fresco y en la nevera no tiene fuente y puede equivocarse mucho: revisa la masa.",
    },
    "equivalent-hours": {
      title: "Horas equivalentes",
      l1: "Tus horas traducidas a las horas necesarias a la temperatura de referencia.",
      l2: "Multiplicamos las horas por la velocidad a tu temperatura. Si fermentas más fresco que la referencia (nevera, bodega), el apresto final y los pliegues antes de la nevera se hacen a la temperatura de referencia: esas horas cuentan tal cual y solo las demás se multiplican. Por eso la cuenta «horas × velocidad» sola no cuadra.",
    },
    "kitchen-temp-default": {
      title: "Temperatura de la cocina",
      l1: "Si no la indicas, usamos un valor estándar.",
      l2: "La temperatura de la cocina cambia los tiempos de fermentación y la temperatura del agua. El valor estándar es una hipótesis: si tu cocina está más caliente o más fría, indícalo y la receta se adapta.",
    },
    "proof-split": {
      title: "Duración del apresto",
      l1: "Cuando el estilo no la indica, el apresto es una parte fija de las horas totales.",
      l2: "Es una hipótesis del modelo, no una regla del método. Si la cocina está más caliente de lo previsto, la masa está lista antes: revísala.",
    },
    "sourdough-starter-dose": {
      title: "Dosis de masa madre",
      l1: "La dosis de masa madre es una regla práctica que depende solo de las horas.",
      l2: "No tiene en cuenta la temperatura ni la fuerza de tu masa madre. La harina y el agua de la masa madre no entran en la hidratación mostrada: la masa real está algo más hidratada.",
    },
    "pre-ferment": {
      title: "Biga y poolish",
      l1: "Hidratación, horas y temperaturas vienen de fuentes del sector concordantes.",
      l2: "La biga es un prefermento seco que madura despacio en fresco; el poolish es líquido y madura más rápido. Corteza y miga dependen sobre todo del horno, la hidratación y el estirado, no solo del prefermento.",
    },
    autolysis: {
      title: "Autólisis",
      l1: "Harina y agua reposan sin levadura ni sal antes del amasado.",
      l2: "No es un prefermento: no fermenta. Hidrata la harina y hace la masa más fácil de trabajar (R. Calvel, 1974).",
    },
    "water-temp-rule": {
      title: "Temperatura del agua",
      l1: "Una cuenta exacta que parte de algunas hipótesis sobre tu cocina.",
      l2: "Cocina, harina, agua y calor de la amasadora suman tres veces la temperatura de masa que quieres. La aritmética es exacta; cocina y harina son estimaciones si no las mides, y el calor de la amasadora es un valor típico.",
    },
    "water-activity": {
      title: "Actividad de agua (aw)",
      l1: "Un índice estimado, no medido.",
      l2: "Lo calculamos con una fórmula sencilla a partir de hidratación, sal y azúcar. Sirve para comparar recetas, no para saber cuánto se conserva la pizza: un valor real necesita un instrumento.",
    },
    "dough-indices": {
      title: "Índices de la masa",
      l1: "Red de gluten y proteólisis son índices del modelo, no medidas.",
      l2: "Combinan fuerza de la harina, hidratación y horas con pesos elegidos por {brand}. Sirven para comparar dos recetas, no son valores de laboratorio.",
    },
    "salt-range": {
      title: "Rango de sal",
      l1: "Las marcas de la sal son una elección de {brand}, no un rango con fuente.",
      l2: "Para la Napoletana STG el reglamento da un rango preciso; para los demás estilos mostramos una franja estrecha alrededor del valor de la receta.",
    },
    "stg-salt-timing": {
      title: "La sal en la Napoletana STG",
      l1: "El reglamento disuelve la sal en el agua antes de añadir la harina.",
      l2: "Es el orden del Reglamento UE de la STG. Otros métodos añaden la sal más tarde: para este estilo seguimos el reglamento.",
    },
    /* FW-02 */
    "stg-reference": {
      title: "Receta y pliego",
      l1: "Comparamos algunos valores de la receta con el pliego de la Napoletana STG.",
      l2: "El pliego (Reglamento UE 97/2010) fija la harina, la fermentación, el peso del bollo y la cocción. Si un valor sale de sus intervalos, la receta es «inspirada en la STG» y la diferencia se indica aquí. La puntuación no certifica la conformidad.",
    },
    "flour-w-by-grade": {
      title: "Tipo de harina y fuerza",
      l1: "00, 0, 1 e integral dicen cuán refinada es la harina, no cuán fuerte.",
      l2: "La fuerza (W) cambia de un saco a otro incluso en el mismo tipo. Si el saco no la indica, el modelo usa una estimación por tipo: para un valor real consulta la ficha del molino.",
    },
    "flour-pl-estimate": {
      title: "P/L estimado",
      l1: "Si no indicas el P/L, lo estimamos a partir de la fuerza de la harina.",
      l2: "Es una relación aproximada, limitada al rango del estilo. El valor real está en la ficha técnica de la harina.",
    },
    "stg-flour-w": {
      title: "Fuerza de la harina en la STG",
      l1: "Usamos el rango de la AVPN, más estrecho que el del reglamento STG.",
      l2: "El Reglamento UE de la STG admite harinas más débiles y más fuertes; el reglamento de la AVPN estrecha el rango. Es una elección de {brand}: se indican las dos fuentes.",
    },
    "oven-max-temp": {
      title: "Temperatura máxima del horno",
      l1: "Es la temperatura declarada para tu modelo.",
      l2: "Casi ningún fabricante dice si es la temperatura del aire o de la piedra. Cuando el dato viene de un vendedor o de una reseña lo indicamos; los hornos de las demos tienen datos inventados.",
    },
    "oven-preset-max-temp": {
      title: "Temperatura típica del tipo de horno",
      l1: "Un valor típico: corrígelo con el de tu horno.",
      l2: "Para algunos tipos de horno no tenemos ficha del fabricante ni norma. Si conoces tu horno, indica su temperatura: la receta se adapta.",
    },
    "stg-oven-temp": {
      title: "Horno de la Napoletana STG",
      l1: "Las dos fuentes dan la misma temperatura para superficies distintas.",
      l2: "El reglamento STG la refiere a la solera, el de la AVPN a la bóveda. Ninguna llega al extremo alto del rango que usa el motor: ese valor está por verificar.",
    },
    "style-min-oven-temp": {
      title: "Temperatura mínima del estilo",
      l1: "En muchos estilos el mínimo es una elección del modelo, sin fuente.",
      l2: "Por debajo del mínimo la receta no es factible o es menos fiel. Donde hay un reglamento lo seguimos; en los demás casos el umbral está por verificar.",
    },
    "bake-time-home-preheat": {
      title: "Precalentamiento del horno de casa",
      l1: "La duración del precalentamiento es una hipótesis del modelo.",
      l2: "La piedra y el acero se calientan más despacio que el aire: ponlos en el horno frío, enciéndelo y, si puedes, mide la superficie antes de hornear.",
    },
    "surface-conductivity": {
      title: "Conductividad de la superficie",
      l1: "Lo rápido que la superficie pasa calor a la pizza.",
      l2: "Es la conductividad térmica típica del material, en W/(m·K): los metales vienen de tablas técnicas; piedra y refractario son valores por verificar. La rejilla no tiene superficie de contacto.",
    },
    "baking-energy": {
      title: "Energía de cocción",
      l1: "Un orden de magnitud, no una medida.",
      l2: "Multiplicamos el tiempo de cocción por una potencia típica elegida según la temperatura del horno, igual para leña, gas y eléctrico. No cuenta el precalentamiento.",
    },
    "thickness-factor": {
      title: "Thickness factor",
      l1: "Gramos de masa por cada cm² de pizza.",
      l2: "Es una métrica habitual en las calculadoras de masa norteamericanas, en onzas por pulgada cuadrada; {brand} la expresa en g/cm² para dimensionar los bollos.",
    },
    "score-weights": {
      title: "Pesos de la puntuación",
      l1: "Los pesos de las dimensiones son una elección de {brand}.",
      l2: "En el número «Compatibilidad con tu cocina» solo cuentan la autenticidad y la facilidad: maduración, sostenibilidad y experimentación se muestran aparte y no lo mueven. Los pesos no vienen de una medida: son una regla de la app, igual para todos. La puntuación es luego el valor más bajo entre la media ponderada y la autenticidad.",
    },
    "non-feasible-ceiling": {
      title: "Techo para recetas no factibles",
      l1: "Una receta que no puedes hacer se queda en la franja baja: es una regla de la app.",
      l2: "Así una receta no realizable nunca supera a una que sí puedes hacer, aunque las demás dimensiones sean altas.",
    },
    "authenticity-fuel-cap": {
      title: "Techo de autenticidad por el combustible",
      l1: "Sin el horno que pide el estilo, la autenticidad tiene un techo: es una elección de {brand}.",
      l2: "Cuando un estilo exige leña o carbón, otro horno puede cocer bien pero no sigue el método. El techo es un límite editorial, no una medida de calidad.",
    },
    digestibility: {
      title: "Índice de digestibilidad",
      l1: "Un índice del modelo sobre el proceso, no una promesa de salud.",
      l2: "Tiene en cuenta horas y temperaturas de maduración. No mide cómo digiere una pizza una persona ni certifica que sea adecuada para una dieta.",
    },
    "troubleshooting-thresholds": {
      title: "Umbrales de los problemas",
      l1: "Los umbrales numéricos de los problemas son orientativos.",
      l2: "Son reglas prácticas sin fuente publicada y no tienen en cuenta el estilo: una masa en bandeja, por ejemplo, está mucho más hidratada que una napolitana. Úsalos como pista, no como diagnóstico.",
    },
    /* FW-19: piano temporale. */
    "comfort-tolerances": {
      title: "Márgenes de la línea de tiempo cómoda",
      l1: "Los márgenes con los que la línea de tiempo cómoda mueve las esperas son una elección nuestra, no una medición.",
      l2: "Alargamos o acortamos las esperas dentro de márgenes fijos, más amplios en la nevera que a temperatura ambiente, sin pasar horas de la nevera al ambiente y sin recalcular la levadura. Cuanto más te alejas del plan de partida, más cuenta fijarse en el volumen de la masa.",
    },
    "bake-round-recovery": {
      title: "Recuperación del horno entre horneados",
      l1: "El tiempo entre un horneado y otro es una hipótesis del modelo.",
      l2: "Entre una pizza y otra se saca, se mete y la base recupera la temperatura: el horno de casa con piedra necesita minutos, los hornos de pizza menos y los de leña casi nada. Usamos un valor fijo por tipo de horno, no medido en el tuyo.",
    },
  },
  assumptions: {
    "constant-ferment-temp": "La temperatura se mantiene constante durante toda la fase.",
    "time-exponent-no-source": "La corrección por horas usa un exponente elegido por el modelo, sin fuente.",
    "kitchen-temp-standard": "Si no indicas la temperatura de la cocina, usamos un valor estándar.",
    "q10-cold-no-source": "En fresco y en la nevera el factor de velocidad no tiene fuente: el error puede ser grande.",
    "proof-share-default": "Sin indicaciones del estilo, el apresto es una parte fija de las horas.",
    "starter-steps-by-hours": "La dosis de masa madre baja por escalones con las horas, sin considerar la temperatura.",
    "starter-not-in-hydration": "La harina y el agua de la masa madre no cuentan en la hidratación.",
    "preferment-at-maturation-temp": "Con un prefermento, el prefermento maduro está en el punto medio de su temperatura de maduración (biga 18–20 °C, poolish 20–22 °C) y mezclarlo a mano no añade calor por fricción.",
    "flour-at-kitchen-temp": "La harina está a la temperatura de la cocina.",
    "mixer-friction-values": "El calor de la amasadora es un valor típico por verificar; a mano es cero.",
    "coefficients-not-measured": "Los coeficientes de la fórmula los elige el modelo, no están medidos.",
    "grade-is-not-strength": "El tipo de harina indica el refinado, no la fuerza: la W por tipo es una estimación.",
    "oven-temp-surface-unspecified": "No sabemos si la temperatura declarada es la del aire o la de la piedra.",
    "style-min-temp-no-source": "La temperatura mínima del estilo no tiene fuente escrita.",
    "preheat-home-minutes": "La duración del precalentamiento depende solo de la temperatura del horno, no de la superficie.",
    "rack-no-contact": "La rejilla no tiene superficie de contacto: la base se cuece por radiación y aire.",
    "oven-power-steps": "Una potencia típica por franja de temperatura, igual para todos los combustibles.",
    "no-health-claim": "Ninguna afirmación de salud: el índice no mide la digestión de una persona.",
    "thresholds-rules-of-thumb": "Los umbrales son reglas prácticas generales, no ajustadas al estilo.",
    /* FW-19: piano temporale. */
    "comfort-margins-rule-of-thumb": "Los márgenes, más amplios en la nevera que a temperatura ambiente, son reglas prácticas sin fuente.",
    "comfort-yeast-unchanged": "La dosis de levadura sigue siendo la calculada para el plan de partida.",
    "recovery-by-oven-type": "La recuperación depende solo del tipo de horno, no del modelo ni de la superficie.",
    /* FW-02 */
    "stg-partial-check": "Solo comparamos algunos valores: el origen de los ingredientes, la temperatura de la masa y la ejecución no se verifican.",
  },
  /* Revisione ondata 2: formule nella lingua (le parole e i decimali
   * cambiano, i simboli no) e note descrittive delle fonti. */
  formulas: {
    "yeast-dose": "Y = max(0,01 %; min(3 %; Y₀ × (t₀ / tₑ)^0,7 ÷ v(T) × s) ÷ k) · Y₀ = 0,1 % (fresca), t₀ = 24 h, s = 1 fresca / 0,33 seca, k = corrección personal (0,5–2) · tₑ = h si T ≥ 18 °C; por debajo: tₑ = (h − hₐ) + hₐ ÷ v(T), con hₐ = apresto + pliegues a 18 °C · v(T): ver «Temperatura y velocidad de fermentación»",
    "q10-fermentation": "v(T) = Q10ₐ^((T − 18)/10) si T ≥ T_b; por debajo: v(T) = Q10ₐ^((T_b − 18)/10) × Q10_b^((T − T_b)/10) · levadura de panadería: T_b = 10 °C, Q10ₐ = 2,0, Q10_b = 1,6 · masa madre: T_b = 15 °C, Q10ₐ = 2,2, Q10_b = 1,9",
    "equivalent-hours": "T ≥ 18 °C: h₁₈ = h × v(T) · T < 18 °C: h₁₈ = (h − hₐ) × v(T) + hₐ, con hₐ = apresto + pliegues a 18 °C",
    "water-temp-rule": "T_agua = 3 × T_masa − T_ambiente − T_harina − fricción · con un prefermento, masa final: T_agua = 4 × T_masa − T_ambiente − T_harina − T_prefermento − fricción; agua del prefermento: 3 × T_prefermento − T_ambiente − T_harina",
    "water-activity": "Aw ≈ 0,96 + (H − 55) × 0,0005 − sal × 0,006 − azúcar × 0,004",
    "flour-pl-estimate": "P/L ≈ 0,30 + (W − 150) × 0,0015, limitado al intervalo del estilo",
    "baking-energy": "E = P × t · P = 2, 3 u 8 kW según la temperatura del horno",
    "thickness-factor": "TF = peso del bollo (g) / área de la pizza (cm²) · 1 oz/in² ≈ 4,39 g/cm²",
    "score-weights": "C = min(media ponderada de A y F; A) · pesos predeterminados: Autenticidad (A) 55 %, Facilidad (F) 45 % · no factible: C ≤ 39",
  },
  sourceNotes: {
    "internal-db": "base de datos de trabajo interna del proyecto, no pública",
    "demo": "dato de demostración, marca inventada",
    "ovens-secondary": "distribuidores y reseñas de hornos (fuentes secundarias)",
    "autolyse-calvel": "artículo sobre la autólisis (cita a R. Calvel, 1974)",
    "recipes": "recetas",
    "articles": "artículos",
    "abstract-only": "solo se leyó el resumen",
    "manufacturer-sheet": "ficha del fabricante",
    "manufacturer-pages": "páginas de producto del fabricante",
    "manual": "manual de uso",
    "faq": "preguntas frecuentes",
  },
};
