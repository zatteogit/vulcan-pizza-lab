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
  paramYeast: "Fermento",
  detailFermentation: "Fermenta\u00E7\u00E3o",
  detailFlavor: "Sabor",
  detailCrust: "Crosta",
  detailExtensibility: "Extensibilidade",
  detailIdealStyles: "Estilos ideais",
  compLabels: [
    "Hidratação",
    "Fermento",
    "Duração",
    "Temperatura",
    "Sabor",
    "Extensibilidade",
    "Alveolado",
    "Complexidade",
  ],
  items: {
    poolish: {
      origin: "Franc\u00EAs",
      description:
        "Pré-fermento líquido: farinha e água em partes iguais com pouco fermento, 12–16 h a 20–22 °C.",
      hydration: "100% (farinha e água em partes iguais)",
      consistency: "L\u00EDquida, espumosa",
      fermentationType:
        "Rápida: com tanta água, amadurece em poucas horas",
      flavor: "Levemente ácido, notas de avelã",
      crustResult:
        "Leve, dourado intenso, leopard spotting marcado",
      extensibility: "Alta \u2014 f\u00E1cil de abrir",
      idealStyles:
        "Teglia Romana, NY Style, Napolitana contempor\u00E2nea, Focaccia",
      tips: [
        "Pronto quando a superfície está cheia de bolhas e o centro começa a ceder",
        "Mais fermento, menos horas: a 20–22 °C, 0,1% para 15–16 h, 0,3% para 10–12 h",
        "Farinha no poolish: 30–50% da farinha total",
      ],
    },
    biga: {
      origin: "Italiano",
      description:
        "Pré-fermento firme: farinha, 44% de água e 1% de fermento, cerca de 16 h a 18–20 °C.",
      hydration: "44% (até 50% com farinhas integrais)",
      consistency: "Seca, compacta",
      fermentationType:
        "Lenta: com pouca água, amadurece em 16–48 h",
      flavor: "Aromático, floral",
      crustResult: "Crocante, quebradi\u00E7a, alveolado fino",
      extensibility:
        "Baixa \u2014 necessita repouso ap\u00F3s boleamento",
      idealStyles:
        "Pinsa, Pizza al taglio, Pala romana, Pão",
      tips: [
        "Pronta quando está estufada em alguns pontos, cheira a iogurte e borbulha de leve; se tiver gosto azedo, passou do ponto",
        "Biga longa: 24 h a 4–5 °C, depois 24 h a 18–20 °C",
        "Farinha na biga: 20–50% da farinha total, geralmente um terço",
        "Não se usa na Napolitana ETG: o regulamento admite só o método direto",
      ],
    },
    autolisi: {
      origin: "França (R. Calvel, 1974)",
      description:
        "Não é um pré-fermento: farinha e água descansam sem fermento nem sal antes de sovar.",
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
        "Descanso de 20–60 minutos; fermento e sal entram depois",
        "Combina com biga ou poolish",
      ],
    },
  },
  compValues: {
    hydration: {
      biga: "44%",
      poolish: "100%",
      autolisi: "55-75%",
    },
    yeast: {
      biga: "1%",
      poolish: "0,1–0,3%",
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
      poolish: "Levemente ácido",
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
        "Avalia ingredientes, processo e porção",
      scienceNote:
        "A fermentação pode alterar os FODMAP, mas o resultado depende da farinha, dos microrganismos, do processo e da porção. Só as horas não permitem quantificar a redução nem classificar a receita como baixa em FODMAP.",
    },
    histamine: {
      name: "Baixa histamina",
      description:
        "Avalia ingredientes, processo e porção",
      scienceNote:
        "O teor depende de microrganismos, ingredientes, processo e conservação. Não é calculável com uma taxa fixa por hora; uma fermentação curta não garante a sua ausência.",
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
        "A cozedura não garante a eliminação da lactose: verifica os ingredientes e a informação do fabricante.",
    },
    nickel: {
      name: "Baixo n\u00EDquel",
      description:
        "Para alergia sist\u00EAmica ao n\u00EDquel (SNAS)",
      scienceNote:
        "São necessários dados do produto; a força da farinha, por si só, não certifica adequação.",
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
        "As horas de fermentação e o tipo de fermento não certificam adequação a restrições de FODMAP ou histamina.",
      compromiseTip:
        "Avalia ingredientes e porção com dados verificados; uma fermentação longa não garante adequação.",
    },
    gf_fodmap: {
      message:
        "Sem glúten não significa automaticamente baixo em FODMAP: os ingredientes e a porção contam.",
    },
    nickel_general: {
      message:
        "São necessários dados do produto; a força da farinha, por si só, não certifica adequação.",
    },
  },
  warnings: {
    fodmap_low: {
      message:
        "A redução de FODMAP não pode ser determinada apenas pelas horas",
      tip: "Avalia ingredientes e porção com dados verificados; uma fermentação longa não garante adequação.",
    },
    fodmap_good: {
      message:
        "A redução de FODMAP não pode ser determinada apenas pelas horas",
      tip: "Avalia ingredientes e porção com dados verificados; uma fermentação longa não garante adequação.",
    },
    histamine_high: {
      message:
        "O teor de histamina não pode ser determinado pelo tempo e temperatura",
      tip: "Verifica ingredientes e processo: o motor não certifica um nível seguro.",
    },
    histamine_moderate: {
      message:
        "O teor de histamina não pode ser determinado pelo tempo e temperatura",
      tip: "Verifica ingredientes e processo: o motor não certifica um nível seguro.",
    },
    gluten_free: {
      message:
        "Receita usa farinha de trigo \u2014 incompat\u00EDvel com doen\u00E7a cel\u00EDaca",
      tip: "Substitua com mix GF (arroz 40% + milho 30% + quinoa 10% + sorgo 10% + amido 10%) + xantana 1.5%",
    },
    nickel_highW: {
      message:
        "W não mede o teor de níquel",
      tip: "São necessários dados do produto; a força da farinha, por si só, não certifica adequação.",
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
          "Use a dose de fermento calculada para as suas horas e temperatura (a 18 °C por 24 h, cerca de 0,1% de fermento fresco)",
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
          "Adicione 0,5–1% de açúcar ou malte e use o forno no máximo, com pedra ou aço bem preaquecidos",
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
      whyImportant: "W descreve a força global da farinha. Tenacidade e extensibilidade são avaliadas com P, L e P/L: um W alto, por si só, não implica uma massa mais tenaz.",
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
      definition: "Pré-fermento firme de farinha, 44% de água (até 50% com farinhas integrais) e 1% de fermento, maturado cerca de 16 h a 18–20 °C; a biga longa leva 24 h a 4–5 °C mais 24 h a 18–20 °C.",
      whyImportant: "Traz aroma e estrutura à massa final. Geralmente um terço da farinha total (20–50%). Não é admitida na Napolitana ETG, que é de método direto.",
    },
    poolish: {
      name: "Poolish",
      definition: "Pré-fermento líquido: farinha e água em partes iguais com pouco fermento, maturado 12–16 h a 20–22 °C (0,1% de fermento para 15–16 h, 0,3% para 10–12 h).",
      whyImportant: "Amadurece rápido e deixa a massa extensível. Geralmente 30–50% da farinha total. Está pronto quando a superfície fica cheia de bolhas e o centro começa a ceder.",
    },
    autolysis: {
      name: "Aut\u00F3lise",
      definition: "Descanso de farinha e água, sem fermento nem sal, por 20–60 minutos antes de sovar (R. Calvel, 1974). Não é um pré-fermento.",
      whyImportant: "A massa fica mais extensível e mais fácil de trabalhar.",
    },
    bulk_fermentation: {
      name: "Fermenta\u00E7\u00E3o em massa (puntata)",
      definition: "Primeira fermentação, em bloco, depois de sovar e antes de bolear. Conforme o estilo, dura de menos de uma hora a mais de um dia na geladeira: a duração certa é a do modo de preparo.",
      whyImportant: "O glúten relaxa, a fermentação começa e a massa ganha aroma.",
    },
    ball_fermentation: {
      name: "Fermenta\u00E7\u00E3o final (appretto)",
      definition: "Segunda fermentação, depois de bolear: em bolinhas ou, nos estilos de assadeira, direto na assadeira. Dura conforme estilo, temperatura e fermento: a duração certa é a do modo de preparo.",
      whyImportant: "Leva as bolinhas ao volume certo para abrir e assar.",
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
      whyImportant: "A fermentação pode alterar os FODMAP, mas o resultado depende da farinha, dos microrganismos, do processo e da porção. Só as horas não permitem quantificar a redução nem classificar a receita como baixa em FODMAP.",
    },
    histamine: {
      name: "Histamina",
      definition: "Amina biog\u00EAnica resultante da descarboxila\u00E7\u00E3o da histidina. Produzida pelas LAB durante a fermenta\u00E7\u00E3o, presente em queijos maturados e embutidos.",
      whyImportant: "O teor depende de microrganismos, ingredientes, processo e conservação. Não é calculável com uma taxa fixa por hora; uma fermentação curta não garante a sua ausência.",
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
      name: "Atrito da amassadeira",
      definition: "Graus que a amassadeira acrescenta \u00E0 massa enquanto trabalha.",
      whyImportant: "Sovar aquece a massa e adianta a fermenta\u00E7\u00E3o: por isso a \u00E1gua deve ser mais fria quando voc\u00EA usa uma m\u00E1quina.",
      ranges: [
        { label: "\u00C0 m\u00E3o", value: "0" },
        { label: "Amassadeira de garfo", value: "2" },
        { label: "Espiral", value: "3" },
        { label: "Batedeira planet\u00E1ria dom\u00E9stica (massas caseiras)", value: "4" },
        { label: "Planet\u00E1ria", value: "5" },
      ],
    },
    rule_of_55: {
      name: "Temperatura da \u00E1gua (tr\u00EAs temperaturas)",
      definition: "Calcula a que temperatura p\u00F4r a \u00E1gua para a massa chegar \u00E0 temperatura desejada.",
      whyImportant: "Soma das tr\u00EAs temperaturas = 3 \u00D7 massa desejada \u2212 atrito. Na pizzaria tamb\u00E9m se diz \u00ABregra dos 55\u00BB: com a soma fixa em 55 a massa fica perto de 18 \u00B0C (55 \u00F7 3); aqui se usa a meta do estilo, 22\u201324 \u00B0C.",
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
      definition: "Índice heurístico de maturação, não uma medida da digestibilidade individual ou dos FODMAP. Usa horas equivalentes a 18°C, com ajustes para pré-fermento, dose de fermento e frio.",
      ranges: [{"label":"85-100","value":"Índice alto"},{"label":"70-84","value":"Índice médio-alto"},{"label":"50-69","value":"Índice médio"},{"label":"<50","value":"Índice baixo"}],
    },
  },
};