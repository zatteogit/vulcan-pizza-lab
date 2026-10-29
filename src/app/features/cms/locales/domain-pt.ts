/* === DOMAIN DATA i18n — Português === */
import type {
  CmsPreFerment,
  CmsTroubleshootingI18n,
  CmsGlossaryTerms,
  CmsScience,
} from "../cms-context";

export const PRE_FERMENT_PT: Partial<CmsPreFerment> = {
  sectionLabel: "Pr\u00E9-fermento",
  tipsLabel: "Dicas",
  showComparison: "Comparar Biga vs Poolish vs Aut\u00F3lise",
  paramHydration: "Hidrata\u00E7\u00E3o",
  paramDuration: "Dura\u00E7\u00E3o",
  paramTemperature: "Temperatura",
  paramYeast: "Fermento fresco",
  detailFermentation: "Fermenta\u00E7\u00E3o",
  detailFlavor: "Sabor",
  detailCrust: "Crosta",
  detailExtensibility: "Extensibilidade",
  detailIdealStyles: "Estilos ideais",
  /* FW-05 */
  techniqueLabel: "Técnica",
  recipeContextLine: "Nesta receita: {yeast} de fermento sobre {flour} de farinha do pré-fermento ({pct}). Todo o fermento da massa vai no pré-fermento e é dosado pelas horas totais da receita, não só pelas do pré-fermento.",
  compLabels: [
    "Hidratação",
    "Fermento fresco (sobre a farinha do pré-fermento)",
    "Duração",
    "Temperatura",
    "Sabor",
    "Extensibilidade",
  ],
  items: {
    poolish: {
      origin: "Polônia, depois França",
      description:
        "Pré-fermento líquido: farinha e água em partes iguais com pouco fermento, 12–16 h a 20–22 °C.",
      hydration: "100% (farinha e água em partes iguais)",
      consistency: "L\u00EDquida, espumosa",
      fermentationType: "Mais rápido que a biga com o mesmo fermento: com a dose indicada matura em 12–16 h",
      flavor: "Levemente ácido, notas de avelã",
      crustResult:
        "Fina e dourada; cor e manchas dependem do forno e da temperatura",
      extensibility: "Alta (estimativa): fácil de abrir",
      tips: [
        "Pronto quando a superfície está cheia de bolhas e o centro começa a ceder",
        "Mais fermento, menos horas: a 20–22 °C, 0,1% para 15–16 h, 0,3% para 10–12 h",
        "Farinha no poolish: 30–50% da farinha total; a {brand} parte de {poolishFlourPct}",
      ],
    },
    biga: {
      origin: "Itália",
      description: "Pré-fermento firme: farinha, {bigaHydration} de água e cerca de 1% de fermento fresco sobre a farinha da biga, cerca de 16 h a 18–20 °C.",
      hydration: "{bigaHydration} (até 50% com farinhas integrais)",
      consistency: "Seca, compacta",
      fermentationType: "Lenta: com pouca água matura em cerca de 16 h (até 48 h com geladeira)",
      flavor: "Aromático, floral",
      crustResult: "Crocante; a estrutura depende da hidratação e da abertura",
      extensibility:
        "Depende da farinha e da hidratação (a verificar)",
      tips: [
        "Pronta quando está estufada em alguns pontos, cheira a iogurte e borbulha de leve; se tiver gosto azedo, passou do ponto",
        "Biga longa: 24 h a 4–5 °C, depois 24 h a 18–20 °C",
        "Farinha na biga: em geral 30–40% da farinha total; a {brand} parte de {bigaFlourPct} e você pode mudar entre {flourPctMin} e {flourPctMax}",
        "Não se usa na Napolitana ETG: o regulamento admite só o método direto",
      ],
    },
    autolisi: {
      origin: "R. Calvel, França 1974",
      description:
        "Não é um pré-fermento: farinha e água descansam sem fermento nem sal antes de sovar.",
      hydration: "A da receita (muitas vezes se reserva um pouco de água)",
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
      biga: "{bigaHydration}",
      poolish: "{poolishHydration}",
      autolisi: "= receita",
    },
    yeast: {
      biga: "1%",
      poolish: "0,1–0,2%",
      autolisi: "0%",
    },
    duration: {
      biga: "16 h (até 48 h com 24 h na geladeira)",
      poolish: "12–16 h",
      autolisi: "20–60 min",
    },
    temperature: {
      biga: "18–20 °C (biga longa: primeiro 24 h a 4–5 °C)",
      poolish: "20–22 °C",
      autolisi: "Ambiente",
    },
    flavor: {
      biga: "Aromático",
      poolish: "Levemente ácido",
      autolisi: "Neutro",
    },
    extensibility: {
      biga: "Variável",
      poolish: "Alta (estimativa)",
      autolisi: "Alta",
    },
  },
};



export const TROUBLESHOOTING_PT: Partial<CmsTroubleshootingI18n> =
  {
    categories: {
      frying: "Fritura",
      dough: "Massa",
      fermentation: "Fermenta\u00E7\u00E3o",
      shaping: "Modelagem",
      baking: "Cozimento",
      solver: "Algoritmo",
      false_positive: "Falsos alarmes",
    },
    issues: {
      FR01: {
        symptom: "Dourada por fora, crua por dentro",
        cause: "Óleo demasiado quente ou massa demasiado grossa.",
        testRapido: "Abre uma peça de teste e verifica o centro.",
        fixImmediate: "Reduz o lume para as próximas peças; não avalies a cozedura apenas pela cor.",
        prevention: "Usa um termómetro e respeita a temperatura do óleo indicada na receita.",
      },
      FR02: {
        symptom: "Gordurosa e pouco crocante",
        cause: "Óleo demasiado frio ou arrefecido por demasiadas peças juntas.",
        testRapido: "Verifica a temperatura entre as levas.",
        fixImmediate: "Deixa o óleo recuperar a temperatura prevista; frita poucas peças e escorre bem.",
        prevention: "Não sobrecarregues o recipiente e controla a temperatura durante a fritura.",
      },
      FR03: {
        symptom: "O recheio sai para o óleo",
        cause: "Bordos mal selados, furos ou recheio nos bordos.",
        testRapido: "Verifica o fecho das peças ainda cruas.",
        fixImmediate: "Sela melhor as próximas peças; nunca juntes água ao óleo quente.",
        prevention: "Mantém os bordos limpos, doseia o recheio e fecha sem furar a massa.",
      },

      P01: {
        symptom: "Massa pegajosa persistente",
        cause: "Mais água do que a farinha consegue absorver",
        testRapido: "A hidratação da receita passa da absorção indicada na ficha da farinha?",
        fixImmediate: "Acrescente pouca farinha de cada vez (2–3%) e incorpore com dobras delicadas",
        prevention: "Fique perto da absorção declarada pelo moinho; se não souber, comece pela parte baixa da hidratação do estilo",
      },
      P02: {
        symptom: "A massa rasga durante a abertura",
        cause: "Glúten pouco desenvolvido ou ainda não relaxado, massa ainda fria da geladeira; às vezes uma farinha pouco extensível (P/L alto) ou uma massa que passou do ponto",
        testRapido: "Estique devagar uma borda: ela rasga logo em vez de esticar?",
        fixImmediate: "Cubra a bola de massa e deixe descansar em temperatura ambiente por 30–60 min; depois tente de novo",
        prevention: "Respeite os tempos da receita, tire as bolas de massa da geladeira a tempo e use uma farinha com o P/L indicado pelo estilo",
      },
      P03: {
        symptom: "A massa desaba ao tocar",
        cause: "Fermentação passou do ponto: tempo demais, calor demais ou fermento demais",
        testRapido: "Aperte com um dedo: se a marca volta na hora ainda falta, se volta devagar está pronta, se fica e a massa murcha passou do ponto",
        fixImmediate: "Boleie de novo e deixe recuperar por 1–2 h (vai ter menos alvéolos), ou abra com delicadeza e asse logo",
        prevention: "Confira a massa a partir do último terço do tempo previsto, não só o relógio",
      },
      P04: {
        symptom: "A massa não cresce no tempo previsto",
        cause: "Fermento pouco ativo ou vencido, ou massa mais fria do que o previsto. Na geladeira é normal crescer pouco",
        testRapido: "Estava na geladeira? É normal. Se não, dissolva uma pitada do fermento em água morna com um pouco de açúcar: faz espuma depois de 10–15 min?",
        fixImmediate: "Primeiro coloque num lugar quente (24–28 °C) por 1–2 h. Se não voltar a crescer, o fermento está inativo: refaça a massa com fermento novo",
        prevention: "Confira a validade do fermento e a temperatura do ambiente",
      },
      P05: {
        symptom:
          "Fermenta\u00E7\u00E3o muito r\u00E1pida (dobrou em <3h)",
        cause:
          "Muito fermento (>1.5%) ou temperatura ambiente >28\u00B0C",
        testRapido: "A massa dobrou em menos de 3 horas?",
        fixImmediate:
          "Refrigere a massa para abrandar a fermentação; o frio não a interrompe de imediato.",
        prevention:
          "Use a dose de fermento calculada para as suas horas e temperatura (a 18 °C por 24 h, cerca de 0,1% de fermento fresco)",
      },
      P06: {
        symptom: "Sabor muito \u00E1cido/ac\u00E9tico",
        cause: "Maturação longa demais ou quente demais: as bactérias lácticas produzem ácidos (acontece mais com fermento natural)",
        testRapido: "Cheire e prove um pedacinho cru: a acidez é picante, como de vinagre?",
        fixImmediate: "Dá para comer; da próxima vez encurte a maturação em temperatura ambiente",
        prevention:
          "Escolha tempo, temperatura e fermento conforme o método; não há limite horário universal.",
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
        cause: "Bolhas grandes que ficaram na bola de massa e abertura muito delicada",
        testRapido: "As bolhas grandes estão espalhadas também pelo centro, não só na borda?",
        fixImmediate:
          "Pressione levemente a bolinha antes de abrir para redistribuir o g\u00E1s",
        prevention: "Antes de abrir, desinfle com cuidado as bolhas maiores; na napolitana e na canotto alguns alvéolos grandes na borda são desejados",
      },
      P09: {
        symptom: "Base crua mas borda queimada",
        cause:
          "Desequil\u00EDbrio t\u00E9rmico: muito calor de cima, pouco de baixo",
        testRapido:
          "Contraste de cor extremo entre cima e baixo?",
        fixImmediate: "Asse mais perto do lastro quente e mais longe do teto; se o forno não passar de 300 °C, você pode pré-assar a base por 2–3 min sem cobertura",
        prevention: "Equilibre o calor: pedra ou aço bem preaquecidos embaixo, menos calor por cima",
      },
      P10: {
        symptom: "Crosta p\u00E1lida, sem dourar",
        cause: "Forno ou lastro pouco quentes para o estilo, ou poucos açúcares depois de uma maturação muito longa",
        testRapido: "O forno chega à temperatura do estilo? A maturação foi muito longa?",
        fixImmediate: "Use o grill nos últimos 1–2 minutos, se o forno tiver",
        prevention: "Deixe o forno no máximo com pedra ou aço bem preaquecidos; fora das receitas STG, que não admitem açúcar nem malte, você pode acrescentar 0,5–1% de açúcar ou malte",
      },
      P11: {
        symptom: "Pizza borrachuda, n\u00E3o crocante",
        cause: "Forneamento curto ou baixo demais para a espessura, ou mais água do que o estilo prevê",
        testRapido: "Ao cortar, o miolo ainda está úmido e grudento?",
        fixImmediate: "Asse por mais alguns minutos; se o forno ainda tiver margem, aumente a temperatura",
        prevention: "Fique na hidratação do estilo e asse pelo tempo indicado na receita",
      },
      P14: {
        symptom: "Manchas leopardo na borda (leopard spotting)",
        cause:
          "Bolhas finas da borda que escurecem com o calor muito forte do forno (douramento e queima localizados)",
        testRapido: "As manchas s\u00E3o amargas ao paladar?",
        fixImmediate:
          "N\u00C3O \u00E9 um problema! \u00C9 a caracter\u00EDstica desejada da pizza napolitana",
        prevention:
          "Se muito marcadas: gire a pizza a cada 20s durante o cozimento",
      },
      P15: {
        symptom: "Fundo da pizza escuro/preto",
        cause: "Lastro mais quente do que o estilo precisa, ou farinha ou semolina queimada na pedra",
        testRapido: "Prove: sabor amargo?",
        fixImmediate:
          "Se amargo = problema (baixe temp). Se saboroso = NORMAL",
        prevention: "Mantenha o lastro na temperatura do estilo e escove a pedra entre uma pizza e outra",
      },
      P16: {
        symptom: "Borda baixa e plana",
        cause: "Desgaseificação excessiva, farinha fraca demais para o estilo ou uso do rolo",
        testRapido: "Altura da borda <1cm?",
        fixImmediate:
          "Abertura mais delicada, n\u00E3o pressionar as bordas",
        prevention: "Use uma farinha com a força indicada pelo estilo e nada de rolo nos estilos com borda",
      },
      P17: {
        symptom: "Pizza muito seca",
        cause: "Menos água do que o estilo prevê ou forneamento mais longo do que o tempo da receita",
        testRapido: "A hidratação e o tempo de forno são os da receita?",
        fixImmediate: "Sirva assim que sair do forno; da próxima vez encurte o forneamento",
        prevention: "Fique na hidratação do estilo e não passe do tempo de forno indicado",
      },
      P18: {
        symptom: "Centro da pizza aguado",
        cause:
          "Cobertura muito l\u00EDquida ou cozimento muito curto",
        testRapido:
          "Quantidade de molho por pizza? Mussarela muito \u00FAmida?",
        fixImmediate: "Pré-asse a base por 2–3 min e depois coloque a cobertura",
        prevention:
          "M\u00E1x 80ml molho por pizza 30cm, escorra bem a mussarela",
      },
      P19: {
        symptom: "Imposs\u00EDvel abrir a bolinha",
        cause: "Farinha bem mais forte do que o estilo prevê: massa tenaz demais",
        testRapido: "O W da sua farinha passa bem do indicado pelo estilo?",
        fixImmediate: "Deixe a bola de massa descansar coberta por 20–30 min e tente de novo; na próxima massa, misture a farinha com uma mais fraca",
        prevention: "Use uma farinha com a força e o P/L indicados pelo estilo",
      },
      P20: {
        symptom: "Cheiro «químico» (álcool, solvente) na massa",
        cause: "Fermentação que passou do ponto (álcool e ésteres) ou fermento demais; mais raramente o cloro da água",
        testRapido: "Cheiro de álcool ou de acetona, e massa mole que não volta a crescer?",
        fixImmediate: "Se estiver mole e não voltar a crescer, trate como massa que passou do ponto: boleie de novo ou asse logo",
        prevention: "Da próxima vez, menos fermento ou um lugar mais fresco. Se a água da torneira tiver gosto de cloro, use outra: deixar descansar ao ar não elimina as cloraminas",
      },
      P21: {
        symptom: "A fermentação muda de uma massa para outra (geladeira de casa)",
        cause: "A geladeira doméstica não mantém a temperatura estável: degelo, aberturas da porta e prateleiras diferentes fazem a maturação a frio oscilar, ao contrário de uma câmara profissional",
        testRapido: "Mesmo estilo, mesma dose de fermento: a fermentação muda muito de uma vez para outra?",
        fixImmediate: "Coloque a massa na prateleira mais baixa/central (a mais estável) e avalie a bolinha a olho, não só pelo relógio",
        prevention: "Meça a temperatura na prateleira usada e observe a massa. O açúcar não corrige as oscilações do frigorífico.",
      },
    },
    contextual: {
      sticky_dough: {
        message:
          "Hidrata\u00E7\u00E3o {h}% com W {w}: risco de massa pegajosa",
        tip: "Este estilo prevê W {wMin}–{wMax}: use uma farinha nessa faixa ou reduza um pouco a hidratação",
      },
      high_pl: {
        message:
          "P/L {pl} alto: poss\u00EDvel massa muito tenaz",
        tip: "Planeje aut\u00F3lise 45min antes de adicionar sal e fermento",
      },
      sour_risk: {
        message: "{h}h a {t}\u00B0C: risco de sabor \u00E1cido",
        tip: "Se a sua cozinha estiver quente, passe parte da maturação para a geladeira e observe mais a massa do que o relógio",
      },
      pale_crust: {
        message:
          "Fermentação curta: verifique o desenvolvimento da massa antes de prosseguir.",
        tip: "Verifique volume, elasticidade e resposta à pressão: as horas, por si só, não comprovam a digestibilidade.",
      },
      cold_oven: {
        message: "Forno a {t} °C, abaixo da temperatura do estilo: risco de crosta pálida e pizza seca",
        tip: "Preaqueça bem a pedra ou o aço e, se o forno tiver grill, use nos últimos minutos",
      },
      beginner_hydration: {
        message:
          "Hidrata\u00E7\u00E3o {h}% \u00E9 desafiadora para iniciantes",
        tip: "Este estilo prevê {hMin}–{hMax}%: se você está começando, fique perto de {hMin}%",
      },
      high_w: {
        message: "W {w} bem acima do estilo: massa difícil de abrir",
        tip: "Este estilo prevê W {wMin}–{wMax}: misture uma farinha mais fraca ou planeje uma autólise longa",
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
      whyImportant: "W descreve a força global da farinha. Tenacidade e extensibilidade se avaliam com P, L e P/L: um W alto não significa sozinho uma massa mais tenaz. Estas faixas são as que a {brand} usa em todo o app; cada estilo indica a sua faixa de W.",
      ranges: [
        { label: "Fraca", value: "{wBandWeak}", note: "Farinha de uso geral ou para confeitaria" },
        { label: "Média", value: "{wBandMedium}", note: "Muitas vezes vendida «para pizza»" },
        { label: "Forte", value: "{wBandStrong}", note: "Maturações longas e massas muito hidratadas" },
        { label: "Muito forte", value: "{wBandVeryStrong}", note: "Manitoba e farinhas para grandes massas doces fermentadas" },
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
      definition: "A relação entre a resistência da massa à deformação e a capacidade de se esticar.",
      whyImportant: "Descreve um equilíbrio reológico: o valor adequado depende da farinha, da hidratação e do método, e não garante altura nem textura da pizza. Os exemplos são as faixas dos estilos da {brand}; o P/L da sua farinha está na ficha técnica do moinho.",
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
      formula: "H% = (peso da água / peso da farinha) × 100",
      whyImportant: "Mais água deixa a massa mais macia e mais difícil de manusear, e pede uma farinha mais forte. A crocância depende sobretudo do forneamento e da espessura: até uma pizza de assadeira muito hidratada pode ficar crocante. Os exemplos são as faixas dos estilos da {brand}.",
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
      definition: "Durante quanto tempo a massa mantém a consistência ao amassar. Mede-se com o farinógrafo.",
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
      definition: "Um fungo unicelular que fermenta açúcares, produzindo dióxido de carbono, álcool e compostos aromáticos.",
      whyImportant: "A atividade depende da cepa, da dose, da temperatura e da massa. O frio desacelera a fermentação; não existe um limite universal de parada imediata. A dose certa depende das horas e da temperatura: a receita calcula para você.",
      ranges: [
        { label: "Fresco, {yeastS1Hours} a {yeastS1Temp}", value: "{yeastS1Pct}", note: "Estimativa do modelo" },
        { label: "Fresco, {yeastS2Hours} a {yeastS2Temp}", value: "{yeastS2Pct}", note: "Estimativa do modelo" },
        { label: "Fresco, {yeastS3Hours} a {yeastS3Temp}", value: "{yeastS3Pct}", note: "Estimativa do modelo" },
        { label: "Fresco, {yeastS4Hours} a {yeastS4Temp}", value: "{yeastS4Pct}", note: "Estimativa do modelo" },
        { label: "Seco (ativo ou instantâneo)", value: "≈ fresco × {yeastDryRatio}", note: "Mesma estimativa do fresco" },
      ],
    },
    lab: {
      name: "LAB (Bact\u00E9rias L\u00E1ticas)",
      definition: "Bact\u00E9rias que fermentam a\u00E7\u00FAcares produzindo \u00E1cido l\u00E1tico (e ac\u00E9tico). Presentes no fermento natural.",
      whyImportant: "Podem alterar acidez e frutanos conforme estirpes, farinha e processo. A sua presença não certifica massa low FODMAP.",
    },
    q10: {
      name: "Q\u2081\u2080 (Coeficiente de Temperatura)",
      definition: "Fator multiplicativo da velocidade de uma rea\u00E7\u00E3o bioqu\u00EDmica a cada aumento de 10\u00B0C.",
      whyImportant: "Com Q₁₀ = {q10ComAbove} a velocidade se multiplica por {q10ComAbove} a cada {tenDegrees}: {q10ExampleRefHours} a {q10RefTemp} ≈ {q10ExampleWarmHours} a {q10ExampleWarmTemp}. Os valores desta entrada são estimativas do modelo da {brand}.",
      ranges: [
        { label: "Fermento comercial ≥ {q10ComBreak}", value: "{q10ComAbove}", note: "Estimativa do modelo, coerente com os dados de crescimento à temperatura ambiente" },
        { label: "Fermento comercial < {q10ComBreak}", value: "{q10ComBelow}", note: "Estimativa do modelo, sem fonte" },
        { label: "Fermento natural > {q10SdBreak}", value: "{q10SdAbove}", note: "Estimativa do modelo" },
        { label: "Fermento natural ≤ {q10SdBreak}", value: "{q10SdBelow}", note: "Estimativa do modelo" },
      ],
    },
    arrhenius: {
      name: "Equa\u00E7\u00E3o de Arrhenius",
      definition: "Relaciona a velocidade de uma reação com a temperatura absoluta (em kelvin) por meio de uma energia de ativação.",
      formula: "k = A · e^(−Eₐ / (R · T)), com T em kelvin",
      whyImportant: "A {brand} não usa esta equação. O motor aplica um Q₁₀ por trechos referido a {q10RefTemp}: {q10ComAbove} acima e {q10ComBelow} abaixo de {q10ComBreak} para o fermento comercial, {q10SdAbove} acima e {q10SdBelow} até {q10SdBreak} para o fermento natural. São estimativas do modelo, não valores medidos.",
    },
    biga: {
      name: "Biga",
      definition: "Pré-massa firme de farinha, {bigaHydration} de água (até 50% com farinhas integrais) e cerca de 1% de fermento fresco sobre a farinha da biga, maturada cerca de 16 h a 18–20 °C; a biga longa passa 24 h a 4–5 °C e depois 24 h a 18–20 °C.",
      whyImportant: "Traz aroma e estrutura à massa final. Em geral 30–40% da farinha total: a {brand} parte de {bigaFlourPct}. Não é admitida na napolitana STG, que é de massa direta.",
    },
    poolish: {
      name: "Poolish",
      definition: "Pré-fermento líquido: farinha e água em partes iguais com pouco fermento, maturado 12–16 h a 20–22 °C (0,1% de fermento para 15–16 h, 0,3% para 10–12 h).",
      whyImportant: "Matura mais rápido que a biga e deixa a massa extensível. Em geral 30–50% da farinha total: a {brand} parte de {poolishFlourPct}. Está pronto quando a superfície está cheia de bolhas e o centro começa a ceder.",
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
      definition: "Conjunto de reações não enzimáticas entre compostos amino e açúcares redutores, favorecidas pelo aquecimento.",
      whyImportant: "Contribui para a cor e os aromas da crosta. A intensidade depende da temperatura superficial, do tempo, da humidade e dos ingredientes; a temperatura do forno não é a do alimento.",
    },
    caramelization: {
      name: "Carameliza\u00E7\u00E3o",
      definition: "Transformações dos açúcares durante o aquecimento, distintas de Maillard e sem exigir compostos amino.",
      whyImportant: "Pode contribuir para a cor e aromas tostados. Depende dos açúcares presentes, da humidade, do tempo e da temperatura superficial.",
    },
    starch_gelatinization: {
      name: "Gelatiniza\u00E7\u00E3o do Amido",
      definition: "Com água e calor, os grânulos de amido hidratam-se, incham e perdem parte da estrutura cristalina. O intervalo depende do amido e da formulação.",
      whyImportant: "Contribui para a estrutura do miolo e a transformação do amido. Uma temperatura central isolada não certifica cozedura completa nem digestibilidade individual.",
    },
    retrogradation: {
      name: "Retrograda\u00E7\u00E3o",
      definition: "Recristaliza\u00E7\u00E3o do amido gelatinizado durante o armazenamento. M\u00E1xima a 4\u00B0C (geladeira).",
      whyImportant: "O miolo fica duro e 'amanhecido'. Retarde com: gorduras 2-3%, a\u00E7\u00FAcares 1-2%, fermenta\u00E7\u00E3o longa, hidrata\u00E7\u00E3o alta.",
    },
    thermal_conductivity: {
      name: "Condutividade T\u00E9rmica",
      definition: "Capacidade de um material de conduzir calor.",
      whyImportant: "Quanto maior o k, mais rápido a superfície passa calor para a base: por isso o aço ajuda os fornos domésticos, que aquecem menos. No lastro também conta quanto calor o material acumula: os fornos a lenha usam tijolo refratário ou biscotto.",
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
      definition: "A gliadina e a glutenina formam, com água e trabalho da massa, uma rede elástica e extensível.",
      whyImportant: "Elasticidade vinda das gluteninas (liga\u00E7\u00F5es S-S), viscosidade das gliadinas (liga\u00E7\u00F5es H). Prote\u00F3lise longa quebra as liga\u00E7\u00F5es \u2192 massa mais extens\u00EDvel.",
    },
    proteolysis: {
      name: "Prote\u00F3lise",
      definition: "As enzimas proteases decompõem as proteínas da massa em moléculas mais pequenas, como péptidos e aminoácidos.",
      whyImportant: "Pode alterar a extensibilidade e a resistência da massa. Depende da farinha, dos microrganismos, da temperatura e do processo: não há uma duração ideal universal e não mede a digestibilidade individual.",
    },
    thickness_factor: {
      name: "Thickness Factor (TF)",
      definition: "Quantidade de massa por unidade de superfície: os gramas de massa por cada cm² de pizza.",
      formula: "TF = peso da bola de massa (g) / área da pizza (cm²)",
      whyImportant: "Métrica comum nas calculadoras de massa norte-americanas (em oz/in²; 1 oz/in² ≈ 4,39 g/cm²). A {brand} a expressa em g/cm² para dimensionar as bolas de massa; junto com o forno, orienta o tempo de forno e a crocância. Os exemplos são calculados a partir do peso da bola de massa e da forma de cada estilo.",
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
      formula: "T_água = 3 × T_massa − T_ambiente − T_farinha − atrito",
      whyImportant: "Soma das tr\u00EAs temperaturas = 3 \u00D7 massa desejada \u2212 atrito. Na pizzaria tamb\u00E9m se diz \u00ABregra dos 55\u00BB: com a soma fixa em 55 a massa fica perto de 18 \u00B0C (55 \u00F7 3); aqui se usa a meta do estilo, 22\u201324 \u00B0C.",
    },
    a_score: {
      name: "A-Score (Autenticidade)",
      definition: "Pontuação de 0 a 100 sobre a proximidade à referência do estilo. Não certifica o cumprimento de um caderno de especificações.",
      formula: "A = Ingredientes × {authWIngredients} + Processo × {authWProcess} + Equipamento × {authWEquipment}",
      ranges: [
        { label: "{aBand0}", value: "Rigorosamente autêntica" },
        { label: "{aBand1}", value: "Fiel com adaptações" },
        { label: "{aBand2}", value: "Inspirada, mas modificada" },
        { label: "{aBand3}", value: "Livremente interpretada" },
      ],
      whyImportant: "Os pesos são uma escolha da {brand}, não uma medida. Regras do produto: sem o combustível previsto pelo estilo, a pontuação não passa de {authFuelCap}; abaixo da temperatura mínima do estilo, ela diminui na mesma proporção.",
    },
    f_score: {
      name: "F-Score (Facilidade)",
      definition: "Pontuação de 0 a 100 sobre a facilidade de preparação com o forno, farinha e experiência disponíveis. Os requisitos que bloqueiam a receita são avaliados à parte.",
      formula: "F = Forno × {feasWOven} + Farinha × {feasWFlour} + Experiência × {feasWSkill}",
      ranges: [
        { label: "{fBand0}", value: "Muito viável" },
        { label: "{fBand1}", value: "Viável com atenção" },
        { label: "{fBand2}", value: "Difícil" },
        { label: "{fBand3}", value: "Risco alto" },
      ],
      whyImportant: "Os pesos são uma escolha da {brand}, não uma medida. Se a receita não puder ser feita com a sua cozinha, a compatibilidade não passa de {nonFeasibleCeiling}, quaisquer que sejam as outras pontuações.",
    },
    d_score: {
      name: "D-Score (Maturação estimada)",
      definition: "Estimativa do modelo baseada em tempo, temperatura, levedura e pré-fermentos. Não mede a digestibilidade individual nem calcula os FODMAP.",
      ranges: [{"label":"{dBand0}","value":"Índice alto"},{"label":"{dBand1}","value":"Índice médio-alto"},{"label":"{dBand2}","value":"Índice médio"},{"label":"{dBand3}","value":"Índice baixo"}],
    },
  },
};
/* FW-01 — Registro científico: textos das notas e hipóteses (chaves como SCIENCE_I18N_DEFAULTS). */
export const SCIENCE_PT: CmsScience = {
  notes: {
    "yeast-dose": {
      title: "Dose de fermento",
      l1: "É uma estimativa: mais horas e mais calor pedem menos fermento.",
      l2: "Partimos de uma dose de referência coerente com os regulamentos napolitanos e a ajustamos às suas horas e à sua temperatura. Fermento, farinha e cozinha reais podem mudar os tempos: observe a massa mais do que o relógio.",
    },
    "q10-fermentation": {
      title: "Temperatura e velocidade de fermentação",
      l1: "Mais calor, fermentação mais rápida; mais frio, mais lenta. O fator é uma estimativa.",
      l2: "O modelo usa um fator de velocidade por faixas em relação a uma temperatura de referência. Em temperatura ambiente concorda com os estudos sobre fermento; no frio e na geladeira não tem fonte e pode errar muito: confira a massa.",
    },
    "equivalent-hours": {
      title: "Horas equivalentes",
      l1: "Suas horas traduzidas nas horas necessárias à temperatura de referência.",
      l2: "Multiplicamos as horas pela velocidade na sua temperatura. Se você fermenta mais frio do que a referência (geladeira, adega), a fermentação final e as dobras antes da geladeira acontecem na temperatura de referência: essas horas contam como são e só as outras são multiplicadas. Por isso a conta «horas × velocidade» sozinha não fecha.",
    },
    "kitchen-temp-default": {
      title: "Temperatura da cozinha",
      l1: "Se você não a informar, usamos um valor padrão.",
      l2: "A temperatura da cozinha muda os tempos de fermentação e a temperatura da água. O valor padrão é uma hipótese: se sua cozinha é mais quente ou mais fria, informe e a receita se adapta.",
    },
    "proof-split": {
      title: "Duração da segunda fermentação",
      l1: "Quando o estilo não a indica, a segunda fermentação é uma parte fixa das horas totais.",
      l2: "É uma hipótese do modelo, não uma regra do método. Se a cozinha estiver mais quente que o previsto, a massa fica pronta antes: confira.",
    },
    "sourdough-starter-dose": {
      title: "Dose de levain",
      l1: "A dose de levain é uma regra prática que depende só das horas.",
      l2: "Não considera a temperatura nem a força do seu levain. A farinha e a água do levain não entram na hidratação mostrada: a massa real é um pouco mais hidratada.",
    },
    "pre-ferment": {
      title: "Biga e poolish",
      l1: "Hidratação, horas e temperaturas vêm de fontes do setor que concordam.",
      l2: "A biga é um pré-fermento firme que matura devagar no fresco; o poolish é líquido e matura mais rápido. Casca e miolo dependem sobretudo do forno, da hidratação e da abertura, não só do pré-fermento.",
    },
    autolysis: {
      title: "Autólise",
      l1: "Farinha e água descansam sem fermento nem sal antes da sova.",
      l2: "Não é um pré-fermento: nada fermenta. Hidrata a farinha e deixa a massa mais fácil de trabalhar (R. Calvel, 1974).",
    },
    "water-temp-rule": {
      title: "Temperatura da água",
      l1: "Uma conta exata, que parte de algumas hipóteses sobre a sua cozinha.",
      l2: "Cozinha, farinha, água e calor da masseira somam três vezes a temperatura de massa desejada. A aritmética é exata; cozinha e farinha são estimativas se você não as mede, e o calor da masseira é um valor típico.",
    },
    "water-activity": {
      title: "Atividade de água (aw)",
      l1: "Um índice estimado, não medido.",
      l2: "Calculamos com uma fórmula simples a partir de hidratação, sal e açúcar. Serve para comparar receitas, não para dizer quanto a pizza dura: um valor real exige um instrumento.",
    },
    "dough-indices": {
      title: "Índices da massa",
      l1: "Rede de glúten e proteólise são índices do modelo, não medidas.",
      l2: "Combinam força da farinha, hidratação e horas com pesos escolhidos pela {brand}. Servem para comparar duas receitas, não são valores de laboratório.",
    },
    "salt-range": {
      title: "Faixa de sal",
      l1: "As marcas do sal são uma escolha da {brand}, não uma faixa com fonte.",
      l2: "Para a Napoletana STG o regulamento dá uma faixa precisa; para os outros estilos mostramos uma faixa estreita em torno do valor da receita.",
    },
    "stg-salt-timing": {
      title: "O sal na Napoletana STG",
      l1: "O regulamento dissolve o sal na água antes de adicionar a farinha.",
      l2: "É a ordem do Regulamento UE da STG. Outros métodos adicionam o sal mais tarde: para este estilo seguimos o regulamento.",
    },
    /* FW-02 */
    "stg-reference": {
      title: "Receita e especificação",
      l1: "Comparamos alguns valores da receita com a especificação da Napoletana STG.",
      l2: "A especificação (Regulamento UE 97/2010) fixa a farinha, a fermentação, o peso da bola de massa e a cozedura. Se um valor sair dos seus intervalos, a receita é «inspirada na STG» e a diferença aparece aqui. A pontuação não certifica a conformidade.",
    },
    "flour-w-by-grade": {
      title: "Tipo de farinha e força",
      l1: "00, 0, 1 e integral dizem quão refinada é a farinha, não quão forte.",
      l2: "A força (W) muda de um saco para outro mesmo no mesmo tipo. Se o saco não a indica, o modelo usa uma estimativa por tipo: para um valor real veja a ficha do moinho.",
    },
    "flour-pl-estimate": {
      title: "P/L estimado",
      l1: "Se você não informar o P/L, nós o estimamos pela força da farinha.",
      l2: "É uma relação aproximada, limitada à faixa do estilo. O valor real está na ficha técnica da farinha.",
    },
    "stg-flour-w": {
      title: "Força da farinha na STG",
      l1: "Usamos a faixa da AVPN, mais estreita que a do regulamento STG.",
      l2: "O Regulamento UE da STG admite farinhas mais fracas e mais fortes; o regulamento da AVPN estreita a faixa. É uma escolha da {brand}: as duas fontes são indicadas.",
    },
    "oven-max-temp": {
      title: "Temperatura máxima do forno",
      l1: "É a temperatura declarada para o seu modelo.",
      l2: "Quase nenhum fabricante diz se é a temperatura do ar ou da pedra. Quando o dado vem de um revendedor ou de uma análise, avisamos; os fornos das demos têm dados inventados.",
    },
    "oven-preset-max-temp": {
      title: "Temperatura típica do tipo de forno",
      l1: "Um valor típico: corrija com o do seu forno.",
      l2: "Para alguns tipos de forno não temos ficha do fabricante nem norma. Se você conhece seu forno, informe a temperatura dele: a receita se adapta.",
    },
    "stg-oven-temp": {
      title: "Forno da Napoletana STG",
      l1: "As duas fontes dão a mesma temperatura para superfícies diferentes.",
      l2: "O regulamento STG a refere ao lastro, o da AVPN à cúpula. Nenhuma chega ao extremo alto da faixa usada pelo motor: esse valor ainda precisa ser verificado.",
    },
    "style-min-oven-temp": {
      title: "Temperatura mínima do estilo",
      l1: "Em muitos estilos o mínimo é uma escolha do modelo, sem fonte.",
      l2: "Abaixo do mínimo a receita não é viável ou é menos fiel. Onde há um regulamento nós o seguimos; nos outros casos o limite ainda precisa ser verificado.",
    },
    "bake-time-home-preheat": {
      title: "Pré-aquecimento do forno doméstico",
      l1: "A duração do pré-aquecimento é uma hipótese do modelo.",
      l2: "Pedra e aço esquentam mais devagar que o ar: coloque-os no forno frio, ligue e, se puder, meça a superfície antes de assar.",
    },
    "surface-conductivity": {
      title: "Condutividade da superfície",
      l1: "Quão rápido a superfície passa calor para a pizza.",
      l2: "É a condutividade térmica típica do material, em W/(m·K): os metais vêm de tabelas técnicas; pedra e refratário ainda precisam ser verificados. A grade não tem superfície de contato.",
    },
    "baking-energy": {
      title: "Energia de cozimento",
      l1: "Uma ordem de grandeza, não uma medida.",
      l2: "Multiplicamos o tempo de forno por uma potência típica escolhida pela temperatura do forno, igual para lenha, gás e elétrico. O pré-aquecimento não conta.",
    },
    "thickness-factor": {
      title: "Thickness factor",
      l1: "Gramas de massa para cada cm² de pizza.",
      l2: "É uma métrica comum nas calculadoras de massa norte-americanas, em onças por polegada quadrada; a {brand} a expressa em g/cm² para dimensionar as bolas de massa.",
    },
    "score-weights": {
      title: "Pesos da pontuação",
      l1: "Os pesos das dimensões são uma escolha da {brand}.",
      l2: "No número «Compatibilidade com a sua cozinha» contam só a autenticidade e a facilidade: maturação, sustentabilidade e experimentação aparecem à parte e não o alteram. Os pesos não vêm de uma medida: são uma regra do app, igual para todos. A pontuação é então o menor valor entre a média ponderada e a autenticidade.",
    },
    "non-feasible-ceiling": {
      title: "Teto para receitas inviáveis",
      l1: "Uma receita que você não pode fazer fica na faixa baixa: é uma regra do app.",
      l2: "Assim uma receita inviável nunca supera uma que você pode fazer, mesmo que as outras dimensões sejam altas.",
    },
    "authenticity-fuel-cap": {
      title: "Teto de autenticidade pelo combustível",
      l1: "Sem o forno que o estilo pede, a autenticidade tem um teto: é uma escolha da {brand}.",
      l2: "Quando um estilo exige lenha ou carvão, outro forno pode assar bem, mas não segue o método. O teto é um limite editorial, não uma medida de qualidade.",
    },
    digestibility: {
      title: "Índice de digestibilidade",
      l1: "Um índice do modelo sobre o processo, não uma promessa de saúde.",
      l2: "Considera horas e temperaturas de maturação. Não mede como uma pessoa digere uma pizza nem atesta que seja adequada a uma dieta.",
    },
    "troubleshooting-thresholds": {
      title: "Limites dos problemas",
      l1: "Os limites numéricos dos problemas são indicativos.",
      l2: "São regras práticas sem fonte publicada e não consideram o estilo: uma massa de assadeira, por exemplo, é muito mais hidratada que uma napolitana. Use-os como pista, não como diagnóstico.",
    },
    /* FW-19: piano temporale. */
    "comfort-tolerances": {
      title: "Margens da linha de tempo confortável",
      l1: "As margens com que a linha de tempo confortável move as esperas são uma escolha nossa, não uma medição.",
      l2: "Alongamos ou encurtamos as esperas dentro de margens fixas, mais largas na geladeira do que em temperatura ambiente, sem passar horas da geladeira para o ambiente e sem recalcular o fermento. Quanto mais você se afasta do plano inicial, mais conta observar o volume da massa.",
    },
    "bake-round-recovery": {
      title: "Recuperação do forno entre os assamentos",
      l1: "O tempo entre um assamento e outro é uma hipótese do modelo.",
      l2: "Entre uma pizza e outra você tira, coloca e o lastro volta à temperatura: o forno doméstico com pedra precisa de minutos, os fornos de pizza de menos, os de lenha quase nada. Usamos um valor fixo por tipo de forno, não medido no seu.",
    },
  },
  assumptions: {
    "constant-ferment-temp": "A temperatura fica constante durante toda a fase.",
    "time-exponent-no-source": "A correção pelas horas usa um expoente escolhido pelo modelo, sem fonte.",
    "kitchen-temp-standard": "Se você não informar a temperatura da cozinha, usamos um valor padrão.",
    "q10-cold-no-source": "No frio e na geladeira o fator de velocidade não tem fonte: o erro pode ser grande.",
    "proof-share-default": "Sem indicação do estilo, a segunda fermentação é uma parte fixa das horas.",
    "starter-steps-by-hours": "A dose de levain cai em degraus com as horas, sem considerar a temperatura.",
    "starter-not-in-hydration": "A farinha e a água do levain não contam na hidratação.",
    "preferment-at-maturation-temp": "Com um pré-fermento, o pré-fermento maduro está no ponto médio da sua temperatura de maturação (biga 18–20 °C, poolish 20–22 °C) e misturá-lo à mão não aquece por fricção.",
    "flour-at-kitchen-temp": "A farinha está na temperatura da cozinha.",
    "mixer-friction-values": "O calor da masseira é um valor típico a verificar; à mão é zero.",
    "coefficients-not-measured": "Os coeficientes da fórmula são escolhidos pelo modelo, não medidos.",
    "grade-is-not-strength": "O tipo de farinha indica o refino, não a força: o W por tipo é uma estimativa.",
    "oven-temp-surface-unspecified": "Não sabemos se a temperatura declarada é a do ar ou a da pedra.",
    "style-min-temp-no-source": "A temperatura mínima do estilo não tem fonte escrita.",
    "preheat-home-minutes": "A duração do pré-aquecimento depende só da temperatura do forno, não da superfície.",
    "rack-no-contact": "A grade não tem superfície de contato: a base assa por radiação e ar.",
    "oven-power-steps": "Uma potência típica por faixa de temperatura, igual para todo combustível.",
    "no-health-claim": "Nenhuma alegação de saúde: o índice não mede a digestão de uma pessoa.",
    "thresholds-rules-of-thumb": "Os limites são regras práticas gerais, não ajustadas ao estilo.",
    /* FW-19: piano temporale. */
    "comfort-margins-rule-of-thumb": "As margens, mais largas na geladeira do que em temperatura ambiente, são regras práticas sem fonte.",
    "comfort-yeast-unchanged": "A dose de fermento continua a calculada para o plano inicial.",
    "recovery-by-oven-type": "A recuperação depende só do tipo de forno, não do modelo nem da superfície.",
    /* FW-02 */
    "stg-partial-check": "Comparamos só alguns valores: a origem dos ingredientes, a temperatura da massa e a execução não são verificadas.",
  },
  /* Revisione ondata 2: formule nella lingua (le parole e i decimali
   * cambiano, i simboli no) e note descrittive delle fonti. */
  formulas: {
    "yeast-dose": "Y = max(0,01 %; min(3 %; Y₀ × (t₀ / tₑ)^0,7 ÷ v(T) × s) ÷ k) · Y₀ = 0,1 % (fresco), t₀ = 24 h, s = 1 fresco / 0,33 seco, k = correção pessoal (0,5–2) · tₑ = h se T ≥ 18 °C; abaixo: tₑ = (h − hₐ) + hₐ ÷ v(T), com hₐ = fermentação final + dobras a 18 °C · v(T): ver «Temperatura e velocidade de fermentação»",
    "q10-fermentation": "v(T) = Q10ₐ^((T − 18)/10) se T ≥ T_b; abaixo: v(T) = Q10ₐ^((T_b − 18)/10) × Q10_b^((T − T_b)/10) · fermento biológico: T_b = 10 °C, Q10ₐ = 2,0, Q10_b = 1,6 · levain natural: T_b = 15 °C, Q10ₐ = 2,2, Q10_b = 1,9",
    "equivalent-hours": "T ≥ 18 °C: h₁₈ = h × v(T) · T < 18 °C: h₁₈ = (h − hₐ) × v(T) + hₐ, com hₐ = fermentação final + dobras a 18 °C",
    "water-temp-rule": "T_água = 3 × T_massa − T_ambiente − T_farinha − atrito · com um pré-fermento, massa final: T_água = 4 × T_massa − T_ambiente − T_farinha − T_pré-fermento − atrito; água do pré-fermento: 3 × T_pré-fermento − T_ambiente − T_farinha",
    "water-activity": "Aw ≈ 0,96 + (H − 55) × 0,0005 − sal × 0,006 − açúcar × 0,004",
    "flour-pl-estimate": "P/L ≈ 0,30 + (W − 150) × 0,0015, limitado ao intervalo do estilo",
    "baking-energy": "E = P × t · P = 2, 3 ou 8 kW conforme a temperatura do forno",
    "thickness-factor": "TF = peso da bola de massa (g) / área da pizza (cm²) · 1 oz/in² ≈ 4,39 g/cm²",
    "score-weights": "C = min(média ponderada de A e F; A) · pesos padrão: Autenticidade (A) 55 %, Facilidade (F) 45 % · não viável: C ≤ 39",
  },
  sourceNotes: {
    "internal-db": "base de dados de trabalho interna do projeto, não pública",
    "demo": "dado de demonstração, marca inventada",
    "ovens-secondary": "revendedores e avaliações de fornos (fontes secundárias)",
    "autolyse-calvel": "artigo sobre a autólise (cita R. Calvel, 1974)",
    "recipes": "receitas",
    "articles": "artigos",
    "abstract-only": "lido apenas o resumo",
    "manufacturer-sheet": "ficha do fabricante",
    "manufacturer-pages": "páginas de produto do fabricante",
    "manual": "manual de uso",
    "faq": "perguntas frequentes",
  },
};
