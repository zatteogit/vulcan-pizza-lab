/* === DOMAIN DATA i18n — Español === */
import type {
  CmsPreFerment,
  CmsDietaryI18n,
  CmsTroubleshootingI18n,
  CmsGlossaryTerms,
} from "../cms-context";

export const PRE_FERMENT_ES: Partial<CmsPreFerment> = {
  sectionLabel: "Pre-fermento",
  tipsLabel: "Consejos",
  showComparison: "Comparar Biga vs Poolish vs Autólisis",
  hideComparison: "Ocultar comparación",
  paramHydration: "Hidratación",
  paramDuration: "Duración",
  paramTemperature: "Temperatura",
  paramPh: "pH final",
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
    "pH final",
    "Sabor",
    "Extensibilidad",
    "Alveolado",
    "Complejidad",
  ],
  items: {
    poolish: {
      origin: "Francés",
      description:
        "Pre-fermento líquido (1:1 harina:agua) con fermentación predominantemente alcohólica. Desarrolla azúcares para una Maillard intensa.",
      hydration: "100% (proporción 1:1)",
      consistency: "Líquida, espumosa",
      fermentationType:
        "Predominante alcohólica (CO₂ + etanol)",
      flavor: "Dulce, maltoso, notas complejas",
      crustResult:
        "Ligera, dorado intenso, leopard spotting marcado",
      extensibility: "Alta — fácil de estirar",
      idealStyles:
        "Teglia Romana, NY Style, Napolitana contemporánea, Focaccia",
      tips: [
        "Punto óptimo: superficie abovedada con burbujas, comenzando a retraerse",
        "Más de 16h el sabor se vuelve demasiado ácido/alcohólico",
        "Si colapsa todavía es utilizable pero reduce el porcentaje del total",
        "Porcentaje de poolish en masa final: 20-40% de la harina total",
      ],
    },
    biga: {
      origin: "Italiano",
      description:
        "Pre-fermento seco (44-48% hidratación) con fermentación láctica + alcohólica. Máxima conservación y complejidad aromática.",
      hydration: "44-48%",
      consistency: "Seca, compacta",
      fermentationType: "Láctica + alcohólica (LAB activos)",
      flavor: "Acidulado, complejo, notas fermentadas",
      crustResult: "Crujiente, quebradiza, alveolado fino",
      extensibility: "Baja — requiere reposo tras el boleado",
      idealStyles:
        "Napolitana clásica, Pinsa, Pizza al taglio, Pan",
      tips: [
        "Si está muy seca: añade 5-10% de agua para facilitar la incorporación",
        'Madura cuando la superficie está agrietada "en cúpula" y el volumen se ha triplicado',
        "Conservable hasta 48h en nevera (refresca con 10% de agua antes de usar)",
        "Porcentaje de biga en masa final: 20-50% de la harina total",
      ],
    },
    autolisi: {
      origin: "Universal",
      description:
        "Reposo enzimático de solo harina+agua (sin levadura ni sal). Desarrolla gluten espontáneamente y activa proteasas/amilasas.",
      hydration: "55-75% (toda el agua de la receta)",
      consistency: "Pastosa",
      fermentationType: "Ninguna (solo actividad enzimática)",
      flavor: "Neutro — no altera el sabor",
      crustResult: "Variable — depende del proceso posterior",
      extensibility: "Alta — masa sedosa y menos pegajosa",
      idealStyles: "Todos los estilos (técnica universal)",
      tips: [
        "Harinas integrales: autólisis más larga (60-90min) para ablandar el salvado",
        "Agua tibia (30-35°C) acelera las enzimas",
        "SIEMPRE antes de añadir sal (la sal inhibe las enzimas)",
        "Reduce el tiempo de amasado un 30% porque el gluten se desarrolla solo",
        "Combinable con Biga o Poolish para resultados superiores",
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
      biga: "16-18°C",
      poolish: "20-22°C",
      autolisi: "Ambiente",
    },
    ph: {
      biga: "5.0-5.3",
      poolish: "4.5-4.8",
      autolisi: "~6.5",
    },
    flavor: {
      biga: "Acidulado",
      poolish: "Dulce/maltoso",
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

export const DIETARY_ES: Partial<CmsDietaryI18n> = {
  info: {
    low_fodmap: {
      name: "Low FODMAP",
      description:
        "Reduce fructanos y oligosacáridos fermentables",
      scienceNote:
        "Fermentación ≥24h reduce FODMAP 70% (Costabile 2014)",
    },
    histamine: {
      name: "Baja histamina",
      description:
        "Limita la acumulación de histamina por fermentación larga",
      scienceNote:
        "La histamina se acumula linealmente. Levadura fresca <6h: seguro (<5 mg/kg)",
    },
    gluten_free: {
      name: "Sin gluten",
      description: "Para celiaquía o sensibilidad al gluten",
      scienceNote:
        "Umbral UE: <20 ppm. Requiere mezcla GF (arroz/maíz/quinoa + xantana 1.5%)",
    },
    lactose_free: {
      name: "Sin lactosa",
      description: "Para intolerancia a la lactosa",
      scienceNote:
        "Cocción >200°C degrada 90%+ de lactosa. Solo SEVERO requiere sustitución",
    },
    nickel: {
      name: "Bajo níquel",
      description: "Para alergia sistémica al níquel (SNAS)",
      scienceNote:
        "Harina 00 (~50 µg/100g) vs integral (~200 µg/100g). Umbral <200 µg/día",
    },
    vegan: {
      name: "Vegano",
      description: "Sin derivados animales",
      scienceNote:
        "La masa base ya es vegana. Atención a toppings y grasas (mantequilla → aceite)",
    },
  },
  conflicts: {
    fodmap_histamine: {
      message:
        "FODMAP requiere fermentación larga (≥24h), histamina requiere fermentación corta (≤12h)",
      compromiseTip:
        "Compromiso: 8-12h con levadura fresca a 18°C. FODMAP reducidos ~40% (sub-óptimo), histamina ~8 mg/kg (aceptable)",
    },
    gf_fodmap: {
      message:
        "¡Compatibles! La mezcla GF elimina la fuente principal de FODMAP (fructanos del trigo)",
    },
    nickel_general: {
      message:
        "Para bajo níquel prefiere harina 00 (50 µg/100g) sobre integral (200 µg/100g)",
    },
  },
  warnings: {
    fodmap_low: {
      message:
        "FODMAP reducidos solo {pct}% — fermentación demasiado corta",
      tip: "Aumenta a ≥24h para alcanzar 70%+ de reducción",
    },
    fodmap_good: {
      message: "FODMAP reducidos {pct}% — buen nivel para SII",
      tip: "La fermentación es suficientemente larga para degradar los fructanos",
    },
    histamine_high: {
      message: "Histamina estimada ~{val} mg/kg — nivel alto",
      tip: "Reduce la fermentación a ≤12h o usa levadura fresca a ≤20°C",
    },
    histamine_moderate: {
      message:
        "Histamina estimada ~{val} mg/kg — nivel moderado",
      tip: "Monitoriza los síntomas. Por seguridad, reduce tiempo o temperatura",
    },
    gluten_free: {
      message:
        "La receta usa harina de trigo — incompatible con celiaquía",
      tip: "Sustituye con mezcla GF (arroz 40% + maíz 30% + quinoa 10% + sorgo 10% + almidón 10%) + xantana 1.5%",
    },
    nickel_highW: {
      message:
        "Harinas fuertes (W alto) tienden a ser menos refinadas, con más níquel",
      tip: "Prefiere harina 00 refinada (W 200-260) para minimizar níquel",
    },
  },
};

export const TROUBLESHOOTING_ES: Partial<CmsTroubleshootingI18n> =
  {
    categories: {
      dough: "Masa",
      fermentation: "Fermentación",
      shaping: "Formado",
      baking: "Cocción",
      solver: "Algoritmo",
      false_positive: "Falsas alarmas",
    },
    issues: {
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
          "Transfiere inmediatamente a 4°C para bloquear la fermentación",
        prevention:
          "Usa 0.2% levadura fresca para 24h, controla temperatura",
      },
      P06: {
        symptom: "Sabor demasiado ácido/acético",
        cause:
          "LAB heterofermentativos activos >48h a >18°C (especialmente con masa madre)",
        testRapido:
          "pH masa — debería ser 4.5-5.5, problemático si <4.2",
        fixImmediate:
          "Añade 0.5-1% azúcar para enmascarar la acidez",
        prevention: "Fermentaciones >24h siempre a 4-8°C",
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
        prevention: "Añade 0.5-1% azúcar, horno al menos 280°C",
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
        prevention: "Truco de Bonci para casa: un 0,5–1 % de azúcar da a la levadura alimento inmediato y hace la fermentación más previsible cuando la nevera es inestable. Solo en estilos que admiten aditivos — nunca en Napoletana STG/AVPN según el reglamento",
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
          "Fermentación corta ({h}h): corteza pálida y digestibilidad limitada",
        tip: "Añade 0.5-1% azúcar para favorecer el dorado Maillard",
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
          "{h}h en nevera sin pre-fermento: posible sabor plano",
        tip: "Añade un pre-fermento (poolish o biga) para complejidad aromática",
      },
    },
  };

export const GLOSSARY_TERMS_ES: Partial<CmsGlossaryTerms> = {
  terms: {
    w_alveograph: {
      name: "W (Alve\u00F3grafo de Chopin)",
      definition: "Energ\u00EDa total necesaria para expandir un alveolo de masa hasta su rotura. Mide la fuerza global de la harina.",
      whyImportant: "W bajo (<180): masa extensible, fermentaci\u00F3n corta. W medio (220-280): ideal para la napolitana, tolera 18-30h. W alto (>300): masa tenaz, necesaria para masas enriquecidas.",
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
      definition: "\u00CDndice de equilibrio mec\u00E1nico. Relaci\u00F3n entre la resistencia y la extensibilidad de la masa.",
      whyImportant: "P/L \u00F3ptimo (0.5-0.6): cornicione alto + base fina. <0.4: pizza plana. >0.8: masa \u00ABgomosa\u00BB.",
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
      definition: "Tiempo durante el cual la masa mantiene una consistencia \u00F3ptima durante el amasado. Se mide con el farin\u00F3grafo.",
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
      definition: "Hongo unicelular que convierte los az\u00FAcares en CO\u2082 + etanol + compuestos arom\u00E1ticos.",
      whyImportant: "Temp. \u00F3ptima: 28-32\u00B0C. M\u00EDn. 4\u00B0C (latente). M\u00E1x. 40\u00B0C (inhibida). Muere a >55\u00B0C.",
      ranges: [
        { label: "Fresca", value: "0.5\u20132.0%", note: "Humedad 70%, nevera 4\u00B0C" },
        { label: "Seca activa", value: "0.3\u20131.0%", note: "Hidratar antes" },
        { label: "Seca instant\u00E1nea", value: "0.2\u20130.8%", note: "Directa" },
      ],
    },
    lab: {
      name: "LAB (Bacterias l\u00E1cticas)",
      definition: "Bacterias que fermentan az\u00FAcares produciendo \u00E1cido l\u00E1ctico (y ac\u00E9tico). Presentes en la masa madre.",
      whyImportant: "Bajan el pH (4.0-4.5), aumentan la acidez, degradan los FODMAP (fructanos), inhiben el moho. Temp. \u00F3ptima: 28-32\u00B0C.",
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
      definition: "Prefermento seco (44-50% de hidrataci\u00F3n) con harina + agua + levadura, fermentado 16-24h a 16-18\u00B0C.",
      whyImportant: "Aporta fuerza, extensibilidad, sabor complejo, alveolado irregular y r\u00FAstico, y mayor vida \u00FAtil. Dosis: 20-40% sobre la harina total.",
    },
    poolish: {
      name: "Poolish",
      definition: "Prefermento l\u00EDquido (100% de hidrataci\u00F3n) con harina + agua 1:1 + levadura, fermentado 12-16h a 16-18\u00B0C.",
      whyImportant: "Extensibilidad alta, alveolado fino y uniforme, sabor agridulce, corteza fina y crujiente. Poolish = extensibilidad; Biga = fuerza.",
    },
    autolysis: {
      name: "Aut\u00F3lisis",
      definition: "Reposo de harina + agua (sin levadura ni sal) durante 20-60 min. Las enzimas proteasas desarrollan el gluten de forma espont\u00E1nea.",
      whyImportant: "Reduce el tiempo de amasado -30-50%, aumenta la extensibilidad, mejora la hidrataci\u00F3n. 20-30 min para W<200, 45-60 min para W>280.",
    },
    bulk_fermentation: {
      name: "Fermentaci\u00F3n en bloque (puntata)",
      definition: "Primera fase de fermentaci\u00F3n tras el amasado, antes de dividir en bollos. La masa reposa en una sola pieza 30 min \u2013 4h.",
      whyImportant: "Relajaci\u00F3n del gluten, inicio de la fermentaci\u00F3n, desarrollo de aromas, aumento de volumen del 20-50%.",
    },
    ball_fermentation: {
      name: "Fermentaci\u00F3n final (appretto)",
      definition: "Segunda fase de fermentaci\u00F3n tras dividir en bollos. Cada bollo reposa por separado 4-48h a 4-22\u00B0C.",
      whyImportant: "Fermentaci\u00F3n principal, maduraci\u00F3n por prote\u00F3lisis, desarrollo del volumen final, estabilizaci\u00F3n del pH.",
    },
    maillard: {
      name: "Reacci\u00F3n de Maillard",
      definition: "Reacci\u00F3n no enzim\u00E1tica entre amino\u00E1cidos y az\u00FAcares reductores a alta temperatura (>140\u00B0C).",
      whyImportant: "Corteza dorada (melanoidinas), aroma tostado (pirazinas), moteado de leopardo a 300\u00B0C+. \u00D3ptima a 160-180\u00B0C.",
    },
    caramelization: {
      name: "Caramelizaci\u00F3n",
      definition: "Degradaci\u00F3n t\u00E9rmica de los az\u00FAcares (sin prote\u00EDnas) a alta temperatura (>150\u00B0C sacarosa, >120\u00B0C fructosa).",
      whyImportant: "Contribuye a las manchas oscuras del cornicione. Menos relevante que la Maillard en la pizza (pocas prote\u00EDnas en superficie).",
    },
    starch_gelatinization: {
      name: "Gelatinizaci\u00F3n del almid\u00F3n",
      definition: "Paso del almid\u00F3n de estado cristalino a gelatinoso al absorber agua. Inicio 55-60\u00B0C, pico 65-70\u00B0C, final 80-85\u00B0C.",
      whyImportant: "Miga: hace digerible el almid\u00F3n (<55\u00B0C en el centro = almid\u00F3n crudo). Corteza: >100\u00B0C \u2192 crujiente.",
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
      whyImportant: "El intestino no digiere los fructanos \u2192 las bacterias los fermentan \u2192 gases/hinchaz\u00F3n. La fermentaci\u00F3n larga los reduce: 24h\u219260-70%, 48h\u219280-85%.",
    },
    histamine: {
      name: "Histamina",
      definition: "Amina bi\u00F3gena procedente de la descarboxilaci\u00F3n de la histidina. La producen las LAB durante la fermentaci\u00F3n; presente en quesos curados y embutidos.",
      whyImportant: "Se acumula de forma lineal con el tiempo. Masa madre 24h/28\u00B0C \u2192 30-50 mg/kg. Personas con d\u00E9ficit de DAO: reacci\u00F3n pseudoal\u00E9rgica. Soluci\u00F3n: fermentaci\u00F3n corta (<12h) + levadura comercial.",
    },
    gluten: {
      name: "Gluten",
      definition: "Complejo proteico viscoel\u00E1stico formado por gliadina (extensible) + glutenina (tenaz) en presencia de agua y amasado.",
      whyImportant: "Elasticidad gracias a las gluteninas (enlaces S-S), viscosidad gracias a las gliadinas (enlaces H). Una prote\u00F3lisis larga rompe enlaces \u2192 masa m\u00E1s extensible.",
    },
    proteolysis: {
      name: "Prote\u00F3lisis",
      definition: "Degradaci\u00F3n de las prote\u00EDnas en p\u00E9ptidos y amino\u00E1cidos por enzimas proteasas. Objetivo: el gluten.",
      whyImportant: "Estirado m\u00E1s f\u00E1cil, mayor digestibilidad, amino\u00E1cidos libres \u2192 sabor umami. Excesiva (>72h): masa demasiado blanda. \u00D3ptima: 24-48h.",
    },
    thickness_factor: {
      name: "Thickness Factor (TF, factor de grosor)",
      definition: "Densidad superficial de la masa \u2014 masa por unidad de \u00E1rea. Indica cu\u00E1nta masa hay por cm\u00B2.",
      whyImportant: "Determina el tiempo de cocci\u00F3n, el crujiente y la densidad cal\u00F3rica. M\u00E9trica original del Proyecto {brand}.",
      ranges: [
        { label: "Napolitana", value: "0.30\u20130.36", note: "6-7 mm" },
        { label: "Tonda romana", value: "0.20\u20130.25", note: "4-5 mm" },
        { label: "New York", value: "0.40\u20130.50", note: "8-10 mm" },
        { label: "Chicago deep dish", value: "1.00\u20131.30", note: "20-26 mm" },
      ],
    },
    friction_factor: {
      name: "Friction Factor (factor de fricci\u00F3n)",
      definition: "Aumento de la temperatura de la masa (\u00B0C) por minuto de amasado, debido a la fricci\u00F3n mec\u00E1nica.",
      whyImportant: "El amasado genera calor \u2192 sube la temperatura \u2192 fermentaci\u00F3n demasiado r\u00E1pida. Se usa en la Regla del 55.",
      ranges: [
        { label: "Manual", value: "0.0" },
        { label: "Amasadora planetaria dom\u00E9stica", value: "0.8\u20131.0" },
        { label: "Amasadora de espiral profesional", value: "0.4\u20130.6" },
        { label: "Amasadora de horquilla", value: "0.2\u20130.3" },
      ],
    },
    rule_of_55: {
      name: "Regla del 55",
      definition: "F\u00F3rmula emp\u00EDrica para calcular la temperatura del agua necesaria para alcanzar la temperatura objetivo de la masa.",
      whyImportant: "55 = constante emp\u00EDrica (var\u00EDa entre 50 y 60 seg\u00FAn la m\u00E1quina). \u0394T_fricci\u00F3n = Friction Factor \u00D7 tiempo de amasado.",
    },
    a_score: {
      name: "A-Score (Autenticidad)",
      definition: "Puntuaci\u00F3n de 0-100 que mide la adherencia de una receta al reglamento del estilo de referencia.",
      ranges: [
        { label: "90-100", value: "Rigurosamente aut\u00E9ntica" },
        { label: "75-89", value: "Sustancialmente aut\u00E9ntica" },
        { label: "60-74", value: "Inspirada en el estilo" },
        { label: "<60", value: "Desviaci\u00F3n significativa" },
      ],
    },
    f_score: {
      name: "F-Score (Viabilidad)",
      definition: "Puntuaci\u00F3n de 0-100 que mide la viabilidad pr\u00E1ctica seg\u00FAn el equipo y la destreza del usuario.",
      ranges: [
        { label: "90-100", value: "Muy factible" },
        { label: "75-89", value: "Factible con cuidado" },
        { label: "60-74", value: "Dif\u00EDcil" },
        { label: "<60", value: "No recomendado" },
      ],
    },
    d_score: {
      name: "D-Score (Digestibilidad)",
      definition: "Puntuaci\u00F3n de 0-100 que estima la digestibilidad a partir de las horas de fermentaci\u00F3n normalizadas y la reducci\u00F3n de FODMAP.",
      ranges: [
        { label: "85-100", value: "Alta (>48h equivalentes)" },
        { label: "70-84", value: "Media-alta (24-48h)" },
        { label: "50-69", value: "Media (12-24h)" },
        { label: "<50", value: "Baja (<12h)" },
      ],
    },
  },
};