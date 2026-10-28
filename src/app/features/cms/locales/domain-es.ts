/* === DOMAIN DATA i18n — Español === */
import type {
  CmsPreFerment,
  CmsTroubleshootingI18n,
  CmsGlossaryTerms,
} from "../cms-context";

export const PRE_FERMENT_ES: Partial<CmsPreFerment> = {
  sectionLabel: "Prefermento",
  tipsLabel: "Consejos",
  showComparison: "Comparar Biga vs Poolish vs Autólisis",
  hideComparison: "Ocultar comparación",
  paramHydration: "Hidratación",
  paramDuration: "Duración",
  paramTemperature: "Temperatura",
  paramYeast: "Levadura",
  detailFermentation: "Fermentación",
  detailFlavor: "Sabor",
  detailCrust: "Corteza",
  detailExtensibility: "Extensibilidad",
  detailIdealStyles: "Estilos ideales",
  compLabels: [
    "Hidratación",
    "Levadura",
    "Duración",
    "Temperatura",
    "Sabor",
    "Extensibilidad",
    "Alveolado",
    "Complejidad",
  ],
  items: {
    poolish: {
      origin: "Francés",
      description:
        "Prefermento líquido: harina y agua a partes iguales con poca levadura, 12–16 h a 20–22 °C.",
      hydration: "100 % (harina y agua a partes iguales)",
      consistency: "Líquida, espumosa",
      fermentationType:
        "Rápida: con tanta agua madura en pocas horas",
      flavor: "Ligeramente ácido, notas de avellana",
      crustResult:
        "Ligera, dorado intenso, leopard spotting marcado",
      extensibility: "Alta — fácil de estirar",
      idealStyles:
        "Teglia Romana, NY Style, Napolitana contemporánea, Focaccia",
      tips: [
        "Listo cuando la superficie está llena de burbujas y el centro empieza a hundirse",
        "Más levadura, menos horas: a 20–22 °C, 0,1 % para 15–16 h, 0,3 % para 10–12 h",
        "Harina en el poolish: 30–50 % de la harina total",
      ],
    },
    biga: {
      origin: "Italiano",
      description:
        "Prefermento seco: harina, 44 % de agua y 1 % de levadura, unas 16 h a 18–20 °C.",
      hydration: "44 % (hasta 50 % con harinas integrales)",
      consistency: "Seca, compacta",
      fermentationType: "Lenta: con poca agua madura en 16–48 h",
      flavor: "Aromático, floral",
      crustResult: "Crujiente, quebradiza, alveolado fino",
      extensibility: "Baja — requiere reposo tras el boleado",
      idealStyles:
        "Pinsa, Pizza al taglio, Pala romana, Pan",
      tips: [
        "Lista cuando está hinchada a trozos, huele a yogur y burbujea un poco; si sabe ácida, se ha pasado",
        "Biga larga: 24 h a 4–5 °C y luego 24 h a 18–20 °C",
        "Harina en la biga: 20–50 % de la harina total, normalmente un tercio",
        "No se usa en la Napolitana ETG: el pliego solo admite el método directo",
      ],
    },
    autolisi: {
      origin: "Francia (R. Calvel, 1974)",
      description:
        "No es un prefermento: harina y agua reposan sin levadura ni sal antes de amasar.",
      hydration: "55-75% (toda el agua de la receta)",
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
      biga: "44 %",
      poolish: "100%",
      autolisi: "55-75%",
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
      autolisi: "Ambiente",
    },
    flavor: {
      biga: "Aromático",
      poolish: "Ligeramente ácido",
      autolisi: "Neutro",
    },
    extensibility: {
      biga: "Baja",
      poolish: "Alta",
      autolisi: "Alta",
    },
    alveolatura: {
      biga: "Fino",
      poolish: "Grande",
      autolisi: "Grande",
    },
    complexity: {
      biga: "Media",
      poolish: "Baja",
      autolisi: "Muy baja",
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
        cause:
          "Hidratación superior a la capacidad de absorción de la harina",
        testRapido:
          "Compara H% receta vs absorción harina (+5% máx)",
        fixImmediate:
          "Añade 2-3% de harina e incorpora con pliegues suaves",
        prevention: "Usa H% ≤ absorción harina + 5%",
      },
      P02: {
        symptom: "La masa se rompe al estirar",
        cause:
          "P/L demasiado alto (>0.8) o fermentación insuficiente (<6h)",
        testRapido: "Estira la bola 10cm: ¿se rompe?",
        fixImmediate:
          "Reposo 60min cubierta a temperatura ambiente",
        prevention:
          "Elige harinas con P/L 0.5-0.6, fermentación mínima 8h",
      },
      P03: {
        symptom: "La masa colapsa al tocarla",
        cause:
          "Sobre-fermentada (volumen >150%, la marca del dedo no vuelve)",
        testRapido: "Presiona con dedo 1cm: ¿vuelve en 3-5s?",
        fixImmediate:
          "Irreversible. Estira con cuidado y hornea inmediatamente",
        prevention:
          "Controla volumen cada 6h, máx +150% aumento",
      },
      P04: {
        symptom: "Sin levado después de 6+ horas",
        cause:
          "Levadura muerta, temperatura muy baja, o sal en contacto directo",
        testRapido:
          "Test vitalidad: 5g levadura + 5g azúcar en 100ml agua 35°C — ¿espuma tras 15min?",
        fixImmediate:
          "Añade 0.3% levadura fresca disuelta en agua tibia, incorpora con pliegues",
        prevention: "Prueba la levadura antes de cada uso",
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
        cause:
          "LAB heterofermentativos activos >48h a >18°C (especialmente con masa madre)",
        testRapido:
          "pH masa — debería ser 4.5-5.5, problemático si <4.2",
        fixImmediate:
          "El azúcar enmascara el sabor, pero no corrige la sobrefermentación. Reevalúa la masa antes de usarla.",
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
        cause:
          "Desgasificación insuficiente + estirado demasiado suave",
        testRapido: "¿Alvéolos >3cm y distribución desigual?",
        fixImmediate:
          "Presiona ligeramente la bola antes de estirar para redistribuir el gas",
        prevention: "Reduce el tiempo de fermentación un 20%",
      },
      P09: {
        symptom: "Base cruda pero borde quemado",
        cause:
          "Desequilibrio térmico: mucho calor de arriba, poco de abajo",
        testRapido:
          "¿Contraste de color extremo entre arriba y abajo?",
        fixImmediate: "Pre-cocción de la base 3min sin topping",
        prevention:
          "Usa bandeja/piedra más gruesa, equilibra calor arriba/abajo",
      },
      P10: {
        symptom: "Corteza pálida, sin dorado",
        cause:
          "Temperatura <250°C, azúcares agotados, o humedad excesiva en superficie",
        testRapido:
          "¿El horno alcanza al menos 250°C? ¿Fermentación >48h?",
        fixImmediate:
          "Pincelar aceite+miel antes de hornear o usar grill final 2min",
        prevention: "Añade 0,5–1 % de azúcar o malta y pon el horno al máximo, con piedra o acero bien precalentados",
      },
      P11: {
        symptom: "Pizza gomosa, no crujiente",
        cause:
          "Temperatura núcleo <85°C, hidratación >70%, o cocción demasiado lenta",
        testRapido: "¿Termómetro núcleo: alcanza 90°C+?",
        fixImmediate:
          "Prolonga cocción +2min o aumenta temperatura +20°C",
        prevention: "H ≤ 65%, temperatura núcleo objetivo 95°C",
      },
      P14: {
        symptom:
          "Manchas leopardo en el borde (leopard spotting)",
        cause:
          "Contacto con bóveda del horno >500°C — reacción de Maillard localizada",
        testRapido: "¿Las manchas son amargas al gusto?",
        fixImmediate:
          "¡NO es un problema! Es la característica deseada de la pizza napolitana",
        prevention:
          "Si muy marcadas: gira la pizza cada 20s durante cocción",
      },
      P15: {
        symptom: "Fondo de pizza oscuro/negro",
        cause: "Piedra o bandeja demasiado caliente (>450°C)",
        testRapido: "Prueba: ¿sabor amargo?",
        fixImmediate:
          "Si amargo = problema (baja temp). Si sabroso = NORMAL",
        prevention:
          "Precalentamiento de piedra controlado, no más de 400°C",
      },
      P16: {
        symptom: "Borde bajo y plano",
        cause:
          "Desgasificación excesiva, W harina muy bajo, o uso de rodillo",
        testRapido: "¿Altura del borde <1cm?",
        fixImmediate:
          "Estirado más delicado, no aplastar los bordes",
        prevention:
          "W ≥ 240 para napolitana, nunca rodillo en estilos con borde",
      },
      P17: {
        symptom: "Pizza demasiado seca",
        cause:
          "Hidratación <55% o cocción demasiado larga (>10min)",
        testRapido:
          "¿H% de la receta? ¿Tiempo real de cocción?",
        fixImmediate: "Añade aceite abundante sobre el topping",
        prevention:
          "H ≥ 58%, no superar tiempo de cocción recomendado",
      },
      P18: {
        symptom: "Centro de la pizza acuoso",
        cause:
          "Topping demasiado líquido o cocción demasiado corta",
        testRapido:
          "¿Cantidad de salsa por pizza? ¿Mozzarella muy húmeda?",
        fixImmediate:
          "Pre-cocción base 2min, luego añade topping",
        prevention:
          "Máx 80ml salsa por pizza 30cm, escurre bien la mozzarella",
      },
      P19: {
        symptom: "Imposible estirar la bola",
        cause:
          "Harina Manitoba pura (W >380), masa demasiado tenaz",
        testRapido: "¿Qué harina usaste? ¿W >350?",
        fixImmediate:
          "Mezcla 50:50 con harina W 200 en el próximo amasado",
        prevention:
          "Máx W 320 para pizza, harinas con P/L 0.5-0.6",
      },
      P20: {
        symptom: "Olor 'químico' en la masa",
        cause: "Agua con cloro alto del grifo",
        testRapido: "¿Hueles fuerte al abrir el grifo?",
        fixImmediate:
          "Usa agua embotellada para el próximo amasado",
        prevention:
          "Filtra el agua o déjala reposar 12h abierta (el cloro se evapora)",
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
        tip: "Usa harina con W ≥ 280 o reduce hidratación a 68-70%",
      },
      high_pl: {
        message: "P/L {pl} alto: posible masa demasiado tenaz",
        tip: "Planifica autólisis 45min antes de añadir sal y levadura",
      },
      sour_risk: {
        message: "{h}h a {t}°C: riesgo de sabor ácido",
        tip: "Para fermentaciones >24h, usa temperatura 4-8°C",
      },
      pale_crust: {
        message:
          "Fermentación breve: comprueba el desarrollo de la masa antes de seguir.",
        tip: "Comprueba el volumen, la elasticidad y la respuesta a la presión: las horas no acreditan la digestibilidad.",
      },
      cold_oven: {
        message:
          "Horno a {t}°C: riesgo de base cruda con borde quemado",
        tip: "Pre-cuece la base 3min sin topping, luego añade ingredientes",
      },
      beginner_hydration: {
        message:
          "Hidratación {h}% es exigente para principiantes",
        tip: "Empieza con 60-65% y aumenta gradualmente con experiencia",
      },
      high_w: {
        message: "W {w} muy alto: masa difícil de estirar",
        tip: "Mezcla 50:50 con harina W 200 o planifica autólisis larga",
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
      whyImportant: "W describe la fuerza global de la harina. La tenacidad y la extensibilidad se evalúan con P, L y P/L: una W alta por sí sola no implica una masa más tenaz.",
      ranges: [
        { label: "Floja", value: "90\u2013160", note: "Galletas, barquillos" },
        { label: "Media", value: "160\u2013200", note: "Pan de molde, focaccia" },
        { label: "Media-fuerte", value: "200\u2013280", note: "Pizza napolitana" },
        { label: "Fuerte", value: "280\u2013350", note: "Panes de larga fermentaci\u00F3n" },
        { label: "Muy fuerte", value: "350\u2013450", note: "Panettone, cruas\u00E1n" },
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
      whyImportant: "Describe el equilibrio reológico. El valor adecuado depende de harina, hidratación y método; no garantiza altura ni textura.",
      ranges: [
        { label: "<0.4 Muy extensible", value: "Se hunde f\u00E1cilmente", note: "Pinsa" },
        { label: "0.4\u20130.5 Extensible", value: "F\u00E1cil de trabajar", note: "Napolitana cl\u00E1sica" },
        { label: "0.5\u20130.7 Equilibrado", value: "Buen equilibrio", note: "Napolitana moderna, pan" },
        { label: "0.7\u20131.0 Tenaz", value: "Resistente", note: "Panes de larga fermentaci\u00F3n" },
        { label: ">1.0 Muy tenaz", value: "El\u00E1stica, se retrae", note: "Cruas\u00E1n" },
      ],
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
      whyImportant: "H baja (<55%): crujiente, f\u00E1cil. H media (60-65%): equilibrio. H alta (>70%): requiere harina fuerte (W>280) y destreza.",
      ranges: [
        { label: "Napolitana cl\u00E1sica", value: "55\u201360%", note: "Blanda, manejable" },
        { label: "Napolitana contempor\u00E1nea", value: "60\u201365%", note: "Cornicione ligero" },
        { label: "Canotto", value: "65\u201370%", note: "Alveolos grandes" },
        { label: "Pinsa romana", value: "75\u201385%", note: "Extendida en bandeja" },
        { label: "Focaccia/Bonci", value: "85\u2013100%+", note: "Casi una masa l\u00EDquida" },
      ],
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
      whyImportant: "La actividad depende de cepa, dosis, temperatura y masa. El frío ralentiza la fermentación; no hay un umbral universal de parada inmediata.",
      ranges: [
        { label: "Fresca", value: "0.5\u20132.0%", note: "Humedad 70%, nevera 4\u00B0C" },
        { label: "Seca activa", value: "0.3\u20131.0%", note: "Hidratar antes" },
        { label: "Seca instant\u00E1nea", value: "0.2\u20130.8%", note: "Directa" },
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
      whyImportant: "Con Q\u2081\u2080 = 2 la fermentaci\u00F3n se duplica cada +10\u00B0C: 24h a 18\u00B0C \u2248 12h a 28\u00B0C. Los valores de abajo son estimaciones del modelo de {brand}.",
      ranges: [
        { label: "Levadura comercial \u226510\u00B0C", value: "2.0", note: "Estimaci\u00F3n del modelo, coherente con los datos de crecimiento entre 18 y 25 \u00B0C" },
        { label: "Levadura comercial <10\u00B0C", value: "1.6", note: "Estimaci\u00F3n del modelo, sin fuente" },
        { label: "Masa madre >15\u00B0C", value: "2.2", note: "Estimaci\u00F3n del modelo" },
        { label: "Masa madre \u226415\u00B0C", value: "1.9", note: "Estimaci\u00F3n del modelo" },
      ],
    },
    arrhenius: {
      name: "Ecuaci\u00F3n de Arrhenius",
      definition: "Describe la dependencia de la velocidad de reacci\u00F3n respecto a la temperatura absoluta.",
      whyImportant: "Con \u03B2=0.075 y T_ref=18\u00B0C \u2192 Q\u2081\u2080 \u2248 2.12. Se usa en el motor de {brand} para calcular la dosis de levadura y los tiempos.",
    },
    biga: {
      name: "Biga",
      definition: "Prefermento seco de harina, 44 % de agua (hasta 50 % con harinas integrales) y 1 % de levadura, madurado unas 16 h a 18–20 °C; la biga larga lleva 24 h a 4–5 °C más 24 h a 18–20 °C.",
      whyImportant: "Aporta aroma y estructura a la masa final. Normalmente un tercio de la harina total (20–50 %). No se admite en la Napolitana ETG, que es de método directo.",
    },
    poolish: {
      name: "Poolish",
      definition: "Prefermento líquido: harina y agua a partes iguales con poca levadura, madurado 12–16 h a 20–22 °C (0,1 % de levadura para 15–16 h, 0,3 % para 10–12 h).",
      whyImportant: "Madura rápido y hace la masa extensible. Normalmente el 30–50 % de la harina total. Está listo cuando la superficie está llena de burbujas y el centro empieza a hundirse.",
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
      whyImportant: "Acero (k=50): ideal para hornos dom\u00E9sticos a 280\u00B0C, cocci\u00F3n de 6-8 min. Piedra (k=2): ideal para hornos de le\u00F1a a 450\u00B0C+, cocci\u00F3n de 60-90s.",
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
      whyImportant: "Determina el tiempo de cocci\u00F3n, el crujiente y la densidad cal\u00F3rica. M\u00E9trica original del Proyecto {brand}.",
      ranges: [
        { label: "Napolitana", value: "0.30\u20130.36", note: "6-7 mm" },
        { label: "Tonda romana", value: "0.20\u20130.25", note: "4-5 mm" },
        { label: "New York", value: "0.40\u20130.50", note: "8-10 mm" },
        { label: "Chicago deep dish", value: "1.00\u20131.30", note: "20-26 mm" },
      ],
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
      whyImportant: "Suma de las tres temperaturas = 3 \u00D7 masa deseada \u2212 fricci\u00F3n. En pizzer\u00EDa tambi\u00E9n se llama \u00ABregla del 55\u00BB: con la suma fija en 55 la masa queda en torno a 18 \u00B0C (55 \u00F7 3); aquí se usa la temperatura objetivo del estilo, 22\u201324 \u00B0C.",
    },
    a_score: {
      name: "A-Score (Autenticidad)",
      definition: "Puntuación de 0 a 100 sobre la cercanía a la referencia del estilo. No certifica el cumplimiento de un pliego.",
      ranges: [
        { label: "90-100", value: "Rigurosamente aut\u00E9ntica" },
        { label: "75-89", value: "Sustancialmente aut\u00E9ntica" },
        { label: "60-74", value: "Inspirada en el estilo" },
        { label: "<60", value: "Desviaci\u00F3n significativa" },
      ],
    },
    f_score: {
      name: "F-Score (Facilidad)",
      definition: "Puntuación de 0 a 100 sobre la facilidad de preparación con el horno, harina y experiencia disponibles. Los requisitos que bloquean la receta se evalúan aparte.",
      ranges: [
        { label: "90-100", value: "Muy factible" },
        { label: "75-89", value: "Factible con cuidado" },
        { label: "60-74", value: "Dif\u00EDcil" },
        { label: "<60", value: "No recomendado" },
      ],
    },
    d_score: {
      name: "D-Score (Maduración estimada)",
      definition: "Estimación del modelo basada en tiempo, temperatura, levadura y prefermentos. No mide la digestibilidad individual ni calcula los FODMAP.",
      ranges: [{"label":"85-100","value":"Índice alto"},{"label":"70-84","value":"Índice medio-alto"},{"label":"50-69","value":"Índice medio"},{"label":"<50","value":"Índice bajo"}],
    },
  },
};