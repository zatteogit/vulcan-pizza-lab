/* === DOMAIN DATA i18n — Português === */
import type {
  CmsPreFerment,
  CmsDietaryI18n,
  CmsTroubleshootingI18n,
  CmsGlossaryTerms,
} from "../cms-context";

export const PRE_FERMENT_PT: Partial<CmsPreFerment> = {
  sectionLabel: "Pr\u00E9-fermento",
  tipsLabel: "Dicas",
  showComparison: "Comparar Biga vs Poolish vs Aut\u00F3lise",
  hideComparison: "Ocultar compara\u00E7\u00E3o",
  paramHydration: "Hidrata\u00E7\u00E3o",
  paramDuration: "Dura\u00E7\u00E3o",
  paramTemperature: "Temperatura",
  paramPh: "pH final",
  detailFermentation: "Fermenta\u00E7\u00E3o",
  detailFlavor: "Sabor",
  detailCrust: "Crosta",
  detailExtensibility: "Extensibilidade",
  detailIdealStyles: "Estilos ideais",
  compLabels: [
    "Hidrata\u00E7\u00E3o",
    "Fermento",
    "Dura\u00E7\u00E3o",
    "Temperatura",
    "pH final",
    "Sabor",
    "Extensibilidade",
    "Alveolado",
    "Complexidade",
  ],
  items: {
    poolish: {
      origin: "Franc\u00EAs",
      description:
        "Pr\u00E9-fermento l\u00EDquido (1:1 farinha:\u00E1gua) com fermenta\u00E7\u00E3o predominantemente alco\u00F3lica. Desenvolve a\u00E7\u00FAcares para Maillard intensa.",
      hydration: "100% (propor\u00E7\u00E3o 1:1)",
      consistency: "L\u00EDquida, espumosa",
      fermentationType:
        "Predominante alco\u00F3lica (CO\u2082 + etanol)",
      flavor: "Doce, maltado, notas complexas",
      crustResult:
        "Leve, dourado intenso, leopard spotting marcado",
      extensibility: "Alta \u2014 f\u00E1cil de abrir",
      idealStyles:
        "Teglia Romana, NY Style, Napolitana contempor\u00E2nea, Focaccia",
      tips: [
        "Ponto ideal: superf\u00EDcie abobadada com bolhas, come\u00E7ando a recuar",
        "Ap\u00F3s 16h o sabor fica \u00E1cido/alco\u00F3lico demais",
        "Se desabar ainda \u00E9 utiliz\u00E1vel mas reduza a porcentagem",
        "Porcentagem de poolish: 20-40% da farinha total",
      ],
    },
    biga: {
      origin: "Italiano",
      description:
        "Pr\u00E9-fermento seco (44-48% hidrata\u00E7\u00E3o) com fermenta\u00E7\u00E3o l\u00E1ctica + alco\u00F3lica. M\u00E1xima conserva\u00E7\u00E3o e complexidade arom\u00E1tica.",
      hydration: "44-48%",
      consistency: "Seca, compacta",
      fermentationType:
        "L\u00E1ctica + alco\u00F3lica (LAB ativos)",
      flavor: "Acidulado, complexo, notas fermentadas",
      crustResult: "Crocante, quebradi\u00E7a, alveolado fino",
      extensibility:
        "Baixa \u2014 necessita repouso ap\u00F3s boleamento",
      idealStyles:
        "Napolitana cl\u00E1ssica, Pinsa, Pizza al taglio, P\u00E3o",
      tips: [
        "Se muito seca: adicione 5-10% de \u00E1gua",
        "Madura quando a superf\u00EDcie est\u00E1 rachada e o volume triplicou",
        "Conserv\u00E1vel at\u00E9 48h na geladeira (refrescar com 10% de \u00E1gua antes)",
        "Porcentagem de biga: 20-50% da farinha total",
      ],
    },
    autolisi: {
      origin: "Universal",
      description:
        "Repouso enzim\u00E1tico de farinha+\u00E1gua (sem fermento ou sal). Desenvolve gl\u00FAten espontaneamente e ativa proteases/amilases.",
      hydration: "55-75% (toda a \u00E1gua da receita)",
      consistency: "Pastosa",
      fermentationType:
        "Nenhuma (apenas atividade enzim\u00E1tica)",
      flavor: "Neutro \u2014 n\u00E3o altera o sabor",
      crustResult:
        "Vari\u00E1vel \u2014 depende do processo seguinte",
      extensibility:
        "Alta \u2014 massa sedosa e menos pegajosa",
      idealStyles: "Todos os estilos (t\u00E9cnica universal)",
      tips: [
        "Farinhas integrais: aut\u00F3lise mais longa (60-90min)",
        "Água morna (30-35\u00B0C) acelera as enzimas",
        "SEMPRE antes de adicionar sal (sal inibe enzimas)",
        "Reduz tempo de sova em 30%",
        "Combin\u00E1vel com Biga ou Poolish",
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
      autolisi: "Ambiente",
    },
    ph: {
      biga: "5.0-5.3",
      poolish: "4.5-4.8",
      autolisi: "~6.5",
    },
    flavor: {
      biga: "Acidulado",
      poolish: "Doce/maltado",
      autolisi: "Neutro",
    },
    extensibility: {
      biga: "Baixa",
      poolish: "Alta",
      autolisi: "Alta",
    },
    alveolatura: {
      biga: "Fino",
      poolish: "Grande",
      autolisi: "Grande",
    },
    complexity: {
      biga: "M\u00E9dia",
      poolish: "Baixa",
      autolisi: "Muito baixa",
    },
  },
};

export const DIETARY_PT: Partial<CmsDietaryI18n> = {
  info: {
    low_fodmap: {
      name: "Low FODMAP",
      description:
        "Reduz frutanos e oligossacar\u00EDdeos ferment\u00E1veis",
      scienceNote:
        "Fermenta\u00E7\u00E3o \u226524h reduz FODMAP 70% (Costabile 2014)",
    },
    histamine: {
      name: "Baixa histamina",
      description:
        "Limita ac\u00FAmulo de histamina por fermenta\u00E7\u00E3o longa",
      scienceNote:
        "Histamina acumula linearmente. Fermento fresco <6h: seguro (<5 mg/kg)",
    },
    gluten_free: {
      name: "Sem gl\u00FAten",
      description:
        "Para doen\u00E7a cel\u00EDaca ou sensibilidade ao gl\u00FAten",
      scienceNote:
        "Limiar UE: <20 ppm. Requer mix GF (arroz/milho/quinoa + xantana 1.5%)",
    },
    lactose_free: {
      name: "Sem lactose",
      description: "Para intoler\u00E2ncia \u00E0 lactose",
      scienceNote:
        "Cozimento >200\u00B0C degrada 90%+ da lactose. Apenas SEVERO requer substitui\u00E7\u00E3o",
    },
    nickel: {
      name: "Baixo n\u00EDquel",
      description:
        "Para alergia sist\u00EAmica ao n\u00EDquel (SNAS)",
      scienceNote:
        "Farinha 00 (~50 \u00B5g/100g) vs integral (~200 \u00B5g/100g). Limiar <200 \u00B5g/dia",
    },
    vegan: {
      name: "Vegano",
      description: "Sem derivados animais",
      scienceNote:
        "A massa base j\u00E1 \u00E9 vegana. Aten\u00E7\u00E3o com coberturas e gorduras (manteiga \u2192 azeite)",
    },
  },
  conflicts: {
    fodmap_histamine: {
      message:
        "FODMAP requer fermenta\u00E7\u00E3o longa (\u226524h), histamina requer fermenta\u00E7\u00E3o curta (\u226412h)",
      compromiseTip:
        "Compromisso: 8-12h com fermento fresco a 18\u00B0C. FODMAP reduzidos ~40% (sub\u00F3timo), histamina ~8 mg/kg (aceit\u00E1vel)",
    },
    gf_fodmap: {
      message:
        "Compat\u00EDveis! O mix GF elimina a fonte principal de FODMAP (frutanos do trigo)",
    },
    nickel_general: {
      message:
        "Para baixo n\u00EDquel preferir farinha 00 (50 \u00B5g/100g) em vez de integral (200 \u00B5g/100g)",
    },
  },
  warnings: {
    fodmap_low: {
      message:
        "FODMAP reduzidos apenas {pct}% \u2014 fermenta\u00E7\u00E3o muito curta",
      tip: "Aumente para \u226524h para atingir 70%+ de redu\u00E7\u00E3o",
    },
    fodmap_good: {
      message:
        "FODMAP reduzidos {pct}% \u2014 bom n\u00EDvel para SII",
      tip: "A fermenta\u00E7\u00E3o \u00E9 longa o suficiente para degradar os frutanos",
    },
    histamine_high: {
      message:
        "Histamina estimada ~{val} mg/kg \u2014 n\u00EDvel alto",
      tip: "Reduza a fermenta\u00E7\u00E3o para \u226412h ou use fermento fresco a \u226420\u00B0C",
    },
    histamine_moderate: {
      message:
        "Histamina estimada ~{val} mg/kg \u2014 n\u00EDvel moderado",
      tip: "Monitore os sintomas. Por seguran\u00E7a, reduza tempo ou temperatura",
    },
    gluten_free: {
      message:
        "Receita usa farinha de trigo \u2014 incompat\u00EDvel com doen\u00E7a cel\u00EDaca",
      tip: "Substitua com mix GF (arroz 40% + milho 30% + quinoa 10% + sorgo 10% + amido 10%) + xantana 1.5%",
    },
    nickel_highW: {
      message:
        "Farinhas fortes (W alto) tendem a ser menos refinadas, com mais n\u00EDquel",
      tip: "Prefira farinha 00 refinada (W 200-260) para minimizar n\u00EDquel",
    },
  },
};

export const TROUBLESHOOTING_PT: Partial<CmsTroubleshootingI18n> =
  {
    categories: {
      dough: "Massa",
      fermentation: "Fermenta\u00E7\u00E3o",
      shaping: "Modelagem",
      baking: "Cozimento",
      solver: "Algoritmo",
      false_positive: "Falsos alarmes",
    },
    issues: {
      P01: {
        symptom: "Massa pegajosa persistente",
        cause:
          "Hidrata\u00E7\u00E3o superior \u00E0 capacidade de absor\u00E7\u00E3o da farinha",
        testRapido:
          "Compare H% receita vs absor\u00E7\u00E3o farinha (+5% m\u00E1x)",
        fixImmediate:
          "Adicione 2-3% de farinha e incorpore com dobras suaves",
        prevention:
          "Use H% \u2264 absor\u00E7\u00E3o farinha + 5%",
      },
      P02: {
        symptom: "A massa rasga durante a abertura",
        cause:
          "P/L muito alto (>0.8) ou fermenta\u00E7\u00E3o insuficiente (<6h)",
        testRapido: "Estique a bolinha 10cm: rasga?",
        fixImmediate:
          "Descanso 60min coberta em temperatura ambiente",
        prevention:
          "Escolha farinhas com P/L 0.5-0.6, fermenta\u00E7\u00E3o m\u00EDnima 8h",
      },
      P03: {
        symptom: "A massa desaba ao tocar",
        cause:
          "Sobre-fermentada (volume >150%, marca do dedo n\u00E3o volta)",
        testRapido: "Pressione 1cm com dedo: volta em 3-5s?",
        fixImmediate:
          "Irrevers\u00EDvel. Abra com cuidado e asse imediatamente",
        prevention:
          "Controle volume a cada 6h, m\u00E1x +150% de aumento",
      },
      P04: {
        symptom: "Sem crescimento ap\u00F3s 6+ horas",
        cause:
          "Fermento morto, temperatura muito baixa, ou sal em contato direto",
        testRapido:
          "Teste de vitalidade: 5g fermento + 5g a\u00E7\u00FAcar em 100ml \u00E1gua 35\u00B0C \u2014 espuma ap\u00F3s 15min?",
        fixImmediate:
          "Adicione 0.3% fermento fresco dissolvido em \u00E1gua morna, incorpore com dobras",
        prevention: "Teste o fermento antes de cada uso",
      },
      P05: {
        symptom:
          "Fermenta\u00E7\u00E3o muito r\u00E1pida (dobrou em <3h)",
        cause:
          "Muito fermento (>1.5%) ou temperatura ambiente >28\u00B0C",
        testRapido: "A massa dobrou em menos de 3 horas?",
        fixImmediate:
          "Transfira imediatamente para 4\u00B0C para bloquear a fermenta\u00E7\u00E3o",
        prevention:
          "Use 0.2% fermento fresco para 24h, controle temperatura",
      },
      P06: {
        symptom: "Sabor muito \u00E1cido/ac\u00E9tico",
        cause:
          "LAB heterofermentativos ativos >48h a >18\u00B0C (especialmente com fermento natural)",
        testRapido:
          "pH massa \u2014 deve ser 4.5-5.5, problem\u00E1tico se <4.2",
        fixImmediate:
          "Adicione 0.5-1% a\u00E7\u00FAcar para mascarar acidez",
        prevention:
          "Fermenta\u00E7\u00F5es >24h sempre a 4-8\u00B0C",
      },
      P07: {
        symptom:
          "Bolinha volta el\u00E1stica ap\u00F3s abertura ('efeito mola')",
        cause: "Gl\u00FAten n\u00E3o suficientemente relaxado",
        testRapido:
          "Abra a 30cm \u2014 volta a 25cm ap\u00F3s 30 segundos?",
        fixImmediate:
          "Descanso adicional 15min coberto, abertura em 2 fases",
        prevention:
          "Retire bolinhas da geladeira 60-90min antes de abrir",
      },
      P08: {
        symptom: "Buracos gigantes irregulares na pizza",
        cause:
          "Desgaseifica\u00E7\u00E3o insuficiente + abertura muito delicada",
        testRapido:
          "Alv\u00E9olos >3cm e distribui\u00E7\u00E3o desigual?",
        fixImmediate:
          "Pressione levemente a bolinha antes de abrir para redistribuir o g\u00E1s",
        prevention:
          "Reduza tempo de fermenta\u00E7\u00E3o em 20%",
      },
      P09: {
        symptom: "Base crua mas borda queimada",
        cause:
          "Desequil\u00EDbrio t\u00E9rmico: muito calor de cima, pouco de baixo",
        testRapido:
          "Contraste de cor extremo entre cima e baixo?",
        fixImmediate:
          "Pr\u00E9-cozimento da base 3min sem cobertura",
        prevention:
          "Use assadeira/pedra mais grossa, equilibre calor cima/baixo",
      },
      P10: {
        symptom: "Crosta p\u00E1lida, sem dourar",
        cause:
          "Temperatura <250\u00B0C, a\u00E7\u00FAcares esgotados, ou umidade excessiva na superf\u00EDcie",
        testRapido:
          "O forno atinge pelo menos 250\u00B0C? Fermenta\u00E7\u00E3o >48h?",
        fixImmediate:
          "Pincelar azeite+mel antes de assar ou usar grill final 2min",
        prevention:
          "Adicione 0.5-1% a\u00E7\u00FAcar, forno pelo menos 280\u00B0C",
      },
      P11: {
        symptom: "Pizza borrachuda, n\u00E3o crocante",
        cause:
          "Temperatura do miolo <85\u00B0C, hidrata\u00E7\u00E3o >70%, ou cozimento muito lento",
        testRapido:
          "Term\u00F4metro de miolo: atinge 90\u00B0C+?",
        fixImmediate:
          "Prolongue cozimento +2min ou aumente temperatura +20\u00B0C",
        prevention:
          "H \u2264 65%, temperatura do miolo alvo 95\u00B0C",
      },
      P14: {
        symptom: "Manchas leopardo na borda (leopard spotting)",
        cause:
          "Contato com ab\u00F3bada do forno >500\u00B0C \u2014 rea\u00E7\u00E3o de Maillard localizada",
        testRapido: "As manchas s\u00E3o amargas ao paladar?",
        fixImmediate:
          "N\u00C3O \u00E9 um problema! \u00C9 a caracter\u00EDstica desejada da pizza napolitana",
        prevention:
          "Se muito marcadas: gire a pizza a cada 20s durante o cozimento",
      },
      P15: {
        symptom: "Fundo da pizza escuro/preto",
        cause: "Pedra ou assadeira muito quente (>450\u00B0C)",
        testRapido: "Prove: sabor amargo?",
        fixImmediate:
          "Se amargo = problema (baixe temp). Se saboroso = NORMAL",
        prevention:
          "Pr\u00E9-aquecimento da pedra controlado, n\u00E3o acima de 400\u00B0C",
      },
      P16: {
        symptom: "Borda baixa e plana",
        cause:
          "Desgaseifica\u00E7\u00E3o excessiva, W farinha muito baixo, ou uso de rolo",
        testRapido: "Altura da borda <1cm?",
        fixImmediate:
          "Abertura mais delicada, n\u00E3o pressionar as bordas",
        prevention:
          "W \u2265 240 para napolitana, nunca rolo em estilos com borda",
      },
      P17: {
        symptom: "Pizza muito seca",
        cause:
          "Hidrata\u00E7\u00E3o <55% ou cozimento muito longo (>10min)",
        testRapido: "H% da receita? Tempo real de cozimento?",
        fixImmediate: "Adicione azeite abundante na cobertura",
        prevention:
          "H \u2265 58%, n\u00E3o ultrapassar tempo de cozimento recomendado",
      },
      P18: {
        symptom: "Centro da pizza aguado",
        cause:
          "Cobertura muito l\u00EDquida ou cozimento muito curto",
        testRapido:
          "Quantidade de molho por pizza? Mussarela muito \u00FAmida?",
        fixImmediate:
          "Pr\u00E9-cozimento base 2min, depois adicione cobertura",
        prevention:
          "M\u00E1x 80ml molho por pizza 30cm, escorra bem a mussarela",
      },
      P19: {
        symptom: "Imposs\u00EDvel abrir a bolinha",
        cause:
          "Farinha Manitoba pura (W >380), massa muito tenaz",
        testRapido: "Qual farinha voc\u00EA usou? W >350?",
        fixImmediate:
          "Mistura 50:50 com farinha W 200 na pr\u00F3xima vez",
        prevention:
          "M\u00E1x W 320 para pizza, farinhas com P/L 0.5-0.6",
      },
      P20: {
        symptom: "Cheiro 'qu\u00EDmico' na massa",
        cause: "\u00C1gua da torneira com cloro alto",
        testRapido: "Sente cheiro forte ao abrir a torneira?",
        fixImmediate:
          "Use \u00E1gua mineral para a pr\u00F3xima massa",
        prevention:
          "Filtre a \u00E1gua ou deixe descansar 12h aberta (o cloro evapora)",
      },
    },
    contextual: {
      sticky_dough: {
        message:
          "Hidrata\u00E7\u00E3o {h}% com W {w}: risco de massa pegajosa",
        tip: "Use farinha com W \u2265 280 ou reduza hidrata\u00E7\u00E3o para 68-70%",
      },
      high_pl: {
        message:
          "P/L {pl} alto: poss\u00EDvel massa muito tenaz",
        tip: "Planeje aut\u00F3lise 45min antes de adicionar sal e fermento",
      },
      sour_risk: {
        message: "{h}h a {t}\u00B0C: risco de sabor \u00E1cido",
        tip: "Para fermenta\u00E7\u00F5es >24h, use temperatura 4-8\u00B0C",
      },
      pale_crust: {
        message:
          "Fermenta\u00E7\u00E3o curta ({h}h): crosta p\u00E1lida e digestibilidade limitada",
        tip: "Adicione 0.5-1% a\u00E7\u00FAcar para favorecer o douramento Maillard",
      },
      cold_oven: {
        message:
          "Forno a {t}\u00B0C: risco de base crua com borda queimada",
        tip: "Pr\u00E9-asse a base 3min sem cobertura, depois adicione ingredientes",
      },
      beginner_hydration: {
        message:
          "Hidrata\u00E7\u00E3o {h}% \u00E9 desafiadora para iniciantes",
        tip: "Comece com 60-65% e aumente gradualmente com experi\u00EAncia",
      },
      high_w: {
        message:
          "W {w} muito alto: massa dif\u00EDcil de abrir",
        tip: "Misture 50:50 com farinha W 200 ou planeje aut\u00F3lise longa",
      },
      flat_long_ferment: {
        message:
          "{h}h na geladeira sem pr\u00E9-fermento: poss\u00EDvel sabor sem gra\u00E7a",
        tip: "Adicione um pr\u00E9-fermento (poolish ou biga) para complexidade arom\u00E1tica",
      },
    },
  };

export const GLOSSARY_TERMS_PT: Partial<CmsGlossaryTerms> = {
  terms: {},
};