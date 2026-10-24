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
      name: "Baixo FODMAP",
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
      P21: {
        symptom: "A fermentação muda de uma massa para outra (geladeira de casa)",
        cause: "A geladeira doméstica não mantém a temperatura estável: degelo, aberturas da porta e prateleiras diferentes fazem a maturação a frio oscilar, ao contrário de uma câmara profissional",
        testRapido: "Mesmo estilo, mesma dose de fermento: a fermentação muda muito de uma vez para outra?",
        fixImmediate: "Coloque a massa na prateleira mais baixa/central (a mais estável) e avalie a bolinha a olho, não só pelo relógio",
        prevention: "Dica do Bonci para casa: 0,5–1% de açúcar dá ao fermento alimento imediato e torna a fermentação mais previsível quando a geladeira é instável. Só em estilos que admitem aditivos — nunca na Napoletana STG/AVPN pelo regulamento",
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
  terms: {
    w_alveograph: {
      name: "W (Alve\u00F3grafo de Chopin)",
      definition: "Energia total necess\u00E1ria para expandir uma bolha de massa at\u00E9 ela se romper. Mede a for\u00E7a geral da farinha.",
      whyImportant: "W baixo (<180): massa extens\u00EDvel, fermenta\u00E7\u00E3o curta. W m\u00E9dio (220-280): ideal para a napolitana, tolera 18-30h. W alto (>300): massa tenaz, indicada para massas enriquecidas.",
      ranges: [
        { label: "Fraca", value: "90\u2013160", note: "Biscoitos, wafers" },
        { label: "M\u00E9dia", value: "160\u2013200", note: "P\u00E3o de forma, focaccia" },
        { label: "M\u00E9dia-forte", value: "200\u2013280", note: "Pizza napolitana" },
        { label: "Forte", value: "280\u2013350", note: "P\u00E3o de longa fermenta\u00E7\u00E3o" },
        { label: "Muito forte", value: "350\u2013450", note: "Panettone, croissant" },
      ],
    },
    p_tenacity: {
      name: "P (Tenacidade)",
      definition: "Resist\u00EAncia m\u00E1xima \u00E0 deforma\u00E7\u00E3o. Pico da curva alveogr\u00E1fica \u2014 o quanto a massa resiste ao estiramento.",
      whyImportant: "P alto: massa 'dura', mant\u00E9m a forma no forno. P baixo: massa 'mole', f\u00E1cil de abrir, pode desabar.",
      ranges: [
        { label: "Pizza", value: "40\u201380 mm" },
        { label: "P\u00E3o", value: "80\u2013120 mm" },
        { label: "Croissant", value: "100\u2013140 mm" },
      ],
    },
    l_extensibility: {
      name: "L (Extensibilidade)",
      definition: "Comprimento m\u00E1ximo que a bolha atinge antes de se romper. Mede o quanto a massa pode se alongar.",
      whyImportant: "L alto: massa extens\u00EDvel, f\u00E1cil de abrir sem rasgar. L baixo: massa curta, que rasga.",
      ranges: [
        { label: "Pizza", value: "80\u2013120 mm" },
        { label: "P\u00E3o", value: "60\u2013100 mm" },
      ],
    },
    pl_ratio: {
      name: "P/L (Rela\u00E7\u00E3o Tenacidade/Extensibilidade)",
      definition: "\u00CDndice de equil\u00EDbrio mec\u00E2nico. Rela\u00E7\u00E3o entre a resist\u00EAncia e a extensibilidade da massa.",
      whyImportant: "P/L ideal (0.5-0.6): borda alta + base fina. <0.4: pizza achatada. >0.8: massa 'borrachuda'.",
      ranges: [
        { label: "<0.4 Muito extens\u00EDvel", value: "Desaba facilmente", note: "Pinsa" },
        { label: "0.4\u20130.5 Extens\u00EDvel", value: "F\u00E1cil de trabalhar", note: "Napolitana cl\u00E1ssica" },
        { label: "0.5\u20130.7 Equilibrada", value: "Bom equil\u00EDbrio", note: "Napolitana moderna, p\u00E3o" },
        { label: "0.7\u20131.0 Tenaz", value: "Resistente", note: "P\u00E3o de longa fermenta\u00E7\u00E3o" },
        { label: ">1.0 Muito tenaz", value: "El\u00E1stica, encolhe", note: "Croissant" },
      ],
    },
    falling_number: {
      name: "Falling Number (Hagberg-Perten)",
      definition: "Tempo que uma haste leva para cair atrav\u00E9s de uma suspens\u00E3o de farinha aquecida. Mede a atividade amil\u00E1sica.",
      whyImportant: "FN baixo (<250): fermenta\u00E7\u00E3o r\u00E1pida, mas massa inst\u00E1vel. FN alto (>300): est\u00E1vel para matura\u00E7\u00F5es longas.",
      ranges: [
        { label: "<200 Amilase alt\u00EDssima", value: "Massa grudenta", note: "N\u00E3o recomendada para pizza" },
        { label: "200\u2013250 Alta", value: "Miolo \u00FAmido", note: "P\u00E3o r\u00E1pido" },
        { label: "250\u2013300 M\u00E9dia", value: "Bom equil\u00EDbrio", note: "Pizza 8-12h" },
        { label: "300\u2013400 Baixa", value: "Seca, lenta", note: "Pizza 24-48h" },
        { label: ">400 Muito baixa", value: "Seca", note: "Macarr\u00E3o seco" },
      ],
    },
    hydration: {
      name: "Hidrata\u00E7\u00E3o (H%)",
      definition: "Porcentagem em peso de \u00E1gua em rela\u00E7\u00E3o \u00E0 farinha na massa.",
      whyImportant: "H baixa (<55%): crocante, f\u00E1cil. H m\u00E9dia (60-65%): equil\u00EDbrio. H alta (>70%): exige farinha forte (W>280) e habilidade.",
      ranges: [
        { label: "Napolitana cl\u00E1ssica", value: "55\u201360%", note: "Macia, trabalh\u00E1vel" },
        { label: "Napolitana contempor\u00E2nea", value: "60\u201365%", note: "Borda leve" },
        { label: "Canotto", value: "65\u201370%", note: "Alv\u00E9olos grandes" },
        { label: "Pinsa romana", value: "75\u201385%", note: "Aberta na assadeira" },
        { label: "Focaccia/Bonci", value: "85\u2013100%+", note: "Massa quase l\u00EDquida" },
      ],
    },
    absorption: {
      name: "Absor\u00E7\u00E3o de \u00C1gua",
      definition: "Quantidade m\u00E1xima de \u00E1gua que uma farinha consegue absorver mantendo uma consist\u00EAncia trabalh\u00E1vel. Depende das prote\u00EDnas, do amido danificado e das fibras.",
      ranges: [
        { label: "00 fraca (W150)", value: "50\u201352%" },
        { label: "00 m\u00E9dia (W220)", value: "53\u201355%" },
        { label: "00 forte (W280)", value: "56\u201358%" },
        { label: "Integral", value: "65\u201375%" },
        { label: "Manitoba (W380)", value: "60\u201365%" },
      ],
    },
    stability: {
      name: "Estabilidade da Massa",
      definition: "Tempo durante o qual a massa mant\u00E9m a consist\u00EAncia ideal durante a sova. Medida com o farin\u00F3grafo.",
      whyImportant: "Estabilidade baixa (<5 min): degrada se for sovada demais. Alta (>10 min): tolera erros operacionais.",
      ranges: [
        { label: "Fraca", value: "2\u20134 min" },
        { label: "M\u00E9dia", value: "5\u20138 min" },
        { label: "Forte", value: "10\u201315 min" },
        { label: "Manitoba", value: "15\u201320 min" },
      ],
    },
    yeast: {
      name: "Fermento (Saccharomyces cerevisiae)",
      definition: "Fungo unicelular que converte a\u00E7\u00FAcares em CO\u2082 + etanol + compostos arom\u00E1ticos.",
      whyImportant: "Temp. ideal: 28-32\u00B0C. M\u00EDn. 4\u00B0C (dormente). M\u00E1x. 40\u00B0C (inibido). Morre acima de 55\u00B0C.",
      ranges: [
        { label: "Fresco", value: "0.5\u20132.0%", note: "Umidade 70%, geladeira a 4\u00B0C" },
        { label: "Seco ativo", value: "0.3\u20131.0%", note: "Hidratar antes" },
        { label: "Seco instant\u00E2neo", value: "0.2\u20130.8%", note: "Direto na farinha" },
      ],
    },
    lab: {
      name: "LAB (Bact\u00E9rias L\u00E1ticas)",
      definition: "Bact\u00E9rias que fermentam a\u00E7\u00FAcares produzindo \u00E1cido l\u00E1tico (e ac\u00E9tico). Presentes no fermento natural.",
      whyImportant: "Baixam o pH (4.0-4.5), aumentam a acidez, degradam FODMAP (frutanos), inibem mofos. Temp. ideal: 28-32\u00B0C.",
    },
    q10: {
      name: "Q\u2081\u2080 (Coeficiente de Temperatura)",
      definition: "Fator multiplicativo da velocidade de uma rea\u00E7\u00E3o bioqu\u00EDmica a cada aumento de 10\u00B0C.",
      whyImportant: "Com Q\u2081\u2080 = 2, a fermenta\u00E7\u00E3o dobra a cada +10\u00B0C: 24h a 18\u00B0C \u2248 12h a 28\u00B0C. Os valores abaixo s\u00E3o estimativas do modelo do {brand}.",
      ranges: [
        { label: "Fermento comercial \u226510\u00B0C", value: "2.0", note: "Estimativa do modelo, coerente com os dados de crescimento entre 18 e 25 \u00B0C" },
        { label: "Fermento comercial <10\u00B0C", value: "1.6", note: "Estimativa do modelo, sem fonte" },
        { label: "Fermento natural >15\u00B0C", value: "2.2", note: "Estimativa do modelo" },
        { label: "Fermento natural \u226415\u00B0C", value: "1.9", note: "Estimativa do modelo" },
      ],
    },
    arrhenius: {
      name: "Equa\u00E7\u00E3o de Arrhenius",
      definition: "Descreve a depend\u00EAncia da velocidade de rea\u00E7\u00E3o em rela\u00E7\u00E3o \u00E0 temperatura absoluta.",
      whyImportant: "Com \u03B2=0.075 e T_ref=18\u00B0C \u2192 Q\u2081\u2080 \u2248 2.12. Usada no motor do {brand} para calcular a dosagem de fermento e os tempos.",
    },
    biga: {
      name: "Biga",
      definition: "Pr\u00E9-massa seca (44-50% de hidrata\u00E7\u00E3o) com farinha + \u00E1gua + fermento, fermentada 16-24h a 16-18\u00B0C.",
      whyImportant: "Aumenta for\u00E7a, extensibilidade, complexidade de sabor, alveolado irregular e r\u00FAstico e durabilidade. Dosagem: 20-40% da farinha total.",
    },
    poolish: {
      name: "Poolish",
      definition: "Pr\u00E9-massa l\u00EDquida (100% de hidrata\u00E7\u00E3o) com farinha + \u00E1gua 1:1 + fermento, fermentada 12-16h a 16-18\u00B0C.",
      whyImportant: "Extensibilidade alta, alveolado fino e uniforme, sabor adocicado e levemente \u00E1cido, crosta fina e crocante. Poolish = extensibilidade; Biga = for\u00E7a.",
    },
    autolysis: {
      name: "Aut\u00F3lise",
      definition: "Descanso de farinha + \u00E1gua (sem fermento/sal) por 20-60 min. As enzimas proteases desenvolvem o gl\u00FAten espontaneamente.",
      whyImportant: "Reduz o tempo de sova em 30-50%, aumenta a extensibilidade, melhora a hidrata\u00E7\u00E3o. 20-30 min para W<200, 45-60 min para W>280.",
    },
    bulk_fermentation: {
      name: "Fermenta\u00E7\u00E3o em massa (puntata)",
      definition: "Primeira fase de fermenta\u00E7\u00E3o ap\u00F3s a sova, antes da divis\u00E3o em bolas. A massa descansa em um \u00FAnico bloco por 30 min \u2013 4h.",
      whyImportant: "Relaxamento do gl\u00FAten, in\u00EDcio da fermenta\u00E7\u00E3o, desenvolvimento de aromas, aumento de volume de 20-50%.",
    },
    ball_fermentation: {
      name: "Fermenta\u00E7\u00E3o final (appretto)",
      definition: "Segunda fase de fermenta\u00E7\u00E3o, ap\u00F3s a divis\u00E3o em bolas. Cada bola descansa individualmente 4-48h a 4-22\u00B0C.",
      whyImportant: "Fermenta\u00E7\u00E3o principal, matura\u00E7\u00E3o por prote\u00F3lise, desenvolvimento do volume final, estabiliza\u00E7\u00E3o do pH.",
    },
    maillard: {
      name: "Rea\u00E7\u00E3o de Maillard",
      definition: "Rea\u00E7\u00E3o n\u00E3o enzim\u00E1tica entre amino\u00E1cidos e a\u00E7\u00FAcares redutores em alta temperatura (>140\u00B0C).",
      whyImportant: "Crosta dourada (melanoidinas), aroma tostado (pirazinas), leopardado a 300\u00B0C+. Ideal: 160-180\u00B0C.",
    },
    caramelization: {
      name: "Carameliza\u00E7\u00E3o",
      definition: "Degrada\u00E7\u00E3o t\u00E9rmica dos a\u00E7\u00FAcares (sem prote\u00EDnas) em alta temperatura (>150\u00B0C sacarose, >120\u00B0C frutose).",
      whyImportant: "Contribui para as manchas escuras na borda. Menos relevante que a rea\u00E7\u00E3o de Maillard na pizza (poucas prote\u00EDnas na superf\u00EDcie).",
    },
    starch_gelatinization: {
      name: "Gelatiniza\u00E7\u00E3o do Amido",
      definition: "Transi\u00E7\u00E3o do amido do estado cristalino para o gelatinoso, absorvendo \u00E1gua. In\u00EDcio 55-60\u00B0C, pico 65-70\u00B0C, conclus\u00E3o 80-85\u00B0C.",
      whyImportant: "Miolo: torna o amido diger\u00EDvel (<55\u00B0C no centro = amido cru). Crosta: >100\u00B0C \u2192 crocante.",
    },
    retrogradation: {
      name: "Retrograda\u00E7\u00E3o",
      definition: "Recristaliza\u00E7\u00E3o do amido gelatinizado durante o armazenamento. M\u00E1xima a 4\u00B0C (geladeira).",
      whyImportant: "O miolo fica duro e 'amanhecido'. Retarde com: gorduras 2-3%, a\u00E7\u00FAcares 1-2%, fermenta\u00E7\u00E3o longa, hidrata\u00E7\u00E3o alta.",
    },
    thermal_conductivity: {
      name: "Condutividade T\u00E9rmica",
      definition: "Capacidade de um material de conduzir calor.",
      whyImportant: "A\u00E7o (k=50): ideal para fornos dom\u00E9sticos a 280\u00B0C, cozimento de 6-8 min. Pedra (k=2): ideal para fornos a lenha a 450\u00B0C+, cozimento de 60-90s.",
      ranges: [
        { label: "Cobre", value: "400" },
        { label: "Alum\u00EDnio", value: "205" },
        { label: "A\u00E7o carbono", value: "50" },
        { label: "A\u00E7o inox", value: "16" },
        { label: "Cordierita (pedra)", value: "2.5\u20133.5" },
        { label: "Pedra refrat\u00E1ria", value: "1.0\u20131.5" },
        { label: "Massa de pizza", value: "0.5" },
      ],
    },
    fodmap: {
      name: "FODMAP",
      definition: "Fermentable Oligosaccharides, Disaccharides, Monosaccharides And Polyols. Carboidratos ferment\u00E1veis de cadeia curta (frutanos: 1-3% no trigo).",
      whyImportant: "O intestino n\u00E3o digere os frutanos \u2192 as bact\u00E9rias os fermentam \u2192 gases/incha\u00E7o. A fermenta\u00E7\u00E3o longa reduz: 24h\u219260-70%, 48h\u219280-85%.",
    },
    histamine: {
      name: "Histamina",
      definition: "Amina biog\u00EAnica resultante da descarboxila\u00E7\u00E3o da histidina. Produzida pelas LAB durante a fermenta\u00E7\u00E3o, presente em queijos maturados e embutidos.",
      whyImportant: "Ac\u00FAmulo linear com o tempo. Fermento natural 24h/28\u00B0C \u2192 30-50 mg/kg. Pessoas com defici\u00EAncia de DAO: rea\u00E7\u00E3o pseudoal\u00E9rgica. Solu\u00E7\u00E3o: fermenta\u00E7\u00E3o curta (<12h) + fermento comercial.",
    },
    gluten: {
      name: "Gl\u00FAten",
      definition: "Complexo proteico viscoel\u00E1stico formado por gliadina (extens\u00EDvel) + glutenina (tenaz) na presen\u00E7a de \u00E1gua e sova.",
      whyImportant: "Elasticidade vinda das gluteninas (liga\u00E7\u00F5es S-S), viscosidade das gliadinas (liga\u00E7\u00F5es H). Prote\u00F3lise longa quebra as liga\u00E7\u00F5es \u2192 massa mais extens\u00EDvel.",
    },
    proteolysis: {
      name: "Prote\u00F3lise",
      definition: "Degrada\u00E7\u00E3o das prote\u00EDnas em pept\u00EDdeos e amino\u00E1cidos por enzimas proteases. Alvo: gl\u00FAten.",
      whyImportant: "Massa mais f\u00E1cil de abrir, maior digestibilidade, amino\u00E1cidos livres \u2192 sabor umami. Excessiva (>72h): massa mole demais. Ideal: 24-48h.",
    },
    thickness_factor: {
      name: "Thickness Factor (TF)",
      definition: "Densidade superficial da massa \u2014 massa por unidade de \u00E1rea. Indica quanta massa h\u00E1 por cm\u00B2.",
      whyImportant: "Determina o tempo de cozimento, a croc\u00E2ncia e a densidade cal\u00F3rica. M\u00E9trica original do Projeto {brand}.",
      ranges: [
        { label: "Napolitana", value: "0.30\u20130.36", note: "6-7 mm" },
        { label: "Romana redonda", value: "0.20\u20130.25", note: "4-5 mm" },
        { label: "New York", value: "0.40\u20130.50", note: "8-10 mm" },
        { label: "Chicago deep dish", value: "1.00\u20131.30", note: "20-26 mm" },
      ],
    },
    friction_factor: {
      name: "Friction Factor (Fator de Atrito)",
      definition: "Aumento da temperatura da massa (\u00B0C) por minuto de sova, devido ao atrito mec\u00E2nico.",
      whyImportant: "A sova gera calor \u2192 eleva a temperatura \u2192 fermenta\u00E7\u00E3o r\u00E1pida demais. Usado na Regra dos 55.",
      ranges: [
        { label: "Manual", value: "0.0" },
        { label: "Batedeira planet\u00E1ria dom\u00E9stica", value: "0.8\u20131.0" },
        { label: "Espiral profissional", value: "0.4\u20130.6" },
        { label: "Amassadeira de garfo", value: "0.2\u20130.3" },
      ],
    },
    rule_of_55: {
      name: "Regra dos 55",
      definition: "F\u00F3rmula emp\u00EDrica para calcular a temperatura da \u00E1gua necess\u00E1ria para atingir a temperatura-alvo da massa.",
      whyImportant: "55 = constante emp\u00EDrica (varia entre 50-60 conforme a m\u00E1quina). \u0394T_atrito = Friction Factor \u00D7 tempo de sova.",
    },
    a_score: {
      name: "A-Score (Autenticidade)",
      definition: "Pontua\u00E7\u00E3o de 0-100 que mede a ader\u00EAncia de uma receita ao regulamento do estilo-alvo.",
      ranges: [
        { label: "90-100", value: "Rigorosamente aut\u00EAntica" },
        { label: "75-89", value: "Substancialmente aut\u00EAntica" },
        { label: "60-74", value: "Inspirada no estilo" },
        { label: "<60", value: "Desvio significativo" },
      ],
    },
    f_score: {
      name: "F-Score (Viabilidade)",
      definition: "Pontua\u00E7\u00E3o de 0-100 que mede a viabilidade pr\u00E1tica, considerando o equipamento e a habilidade do usu\u00E1rio.",
      ranges: [
        { label: "90-100", value: "Muito vi\u00E1vel" },
        { label: "75-89", value: "Vi\u00E1vel com aten\u00E7\u00E3o" },
        { label: "60-74", value: "Dif\u00EDcil" },
        { label: "<60", value: "N\u00E3o recomendado" },
      ],
    },
    d_score: {
      name: "D-Score (Digestibilidade)",
      definition: "Pontua\u00E7\u00E3o de 0-100 que estima a digestibilidade com base nas horas de fermenta\u00E7\u00E3o normalizadas e na redu\u00E7\u00E3o de FODMAP.",
      ranges: [
        { label: "85-100", value: "Alta (>48h equivalentes)" },
        { label: "70-84", value: "M\u00E9dia-alta (24-48h)" },
        { label: "50-69", value: "M\u00E9dia (12-24h)" },
        { label: "<50", value: "Baixa (<12h)" },
      ],
    },
  },
};