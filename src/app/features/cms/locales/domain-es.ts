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
  terms: {},
};