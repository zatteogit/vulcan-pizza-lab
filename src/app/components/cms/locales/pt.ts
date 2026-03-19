import type { CmsContent } from "../cms-context";
import {
  PRE_FERMENT_PT,
  DIETARY_PT,
  TROUBLESHOOTING_PT,
  GLOSSARY_TERMS_PT,
} from "./domain-pt";

/** Portuguese locale bundle */
export const PT_LOCALE: CmsContent = {
  locale: { id: "pt", name: "Portugu\u00EAs" },
  ui: {
    copy: "Copiar",
    copied: "Copiado!",
    share: "Compartilhar",
    back: "Voltar",
    reset: "Redefinir",
    close: "Fechar",
    modify: "Editar",
    disable: "Desativar",
    restore: "Restaurar",
    generate: "Gerar receita",
    chooseStyle: "Escolher estilo",
    customizeParams: "Personalizar par\u00E2metros",
    changeStyle: "Mudar estilo",
    newPizza: "Nova pizza",
    ingredients: "Ingredientes",
    procedure: "Procedimento",
    steps_count: "{n} etapas",
    doughBalls: "Bolas de massa",
    doughBallsFrom: "de {w}g cada",
    totalDough: "total",
    startTime: "In\u00EDcio",
    endTime: "Fim",
    clipboardTitle: "{style} \u2014 Vulcan Pizza Lab",
    clipboardBalls: "{n} bolas de massa de {w}g",
    clipboardTotal: "Total: {g}g",
    clipboardProcedure: "{style} \u2014 Procedimento",
    flour: "Farinha",
    water: "\u00C1gua",
    salt: "Sal",
    sugar: "A\u00E7\u00FAcar",
    oilEvo: "Azeite",
    compTitle: "Ajustes",
    compTitleNerd: "Compensa\u00E7\u00F5es do forno",
    compHydration:
      "Hidrata\u00E7\u00E3o aumentada para compensar o seu forno",
    compOil:
      "Um pouco mais de azeite para manter a pizza macia",
    compSugar:
      "Mais a\u00E7\u00FAcar para uma boa colora\u00E7\u00E3o",
    compCookTime:
      "Tempo de coc\u00E7\u00E3o mais longo para resultado perfeito",
    compThickness:
      "Massa mais fina para coc\u00E7\u00E3o uniforme",
    compDefault: "Par\u00E2metro ajustado ao seu setup",
    ariaReduceBalls: "Reduzir bolas de massa",
    ariaAddBalls: "Aumentar bolas de massa",
    ariaEarlier: "Come\u00E7ar mais cedo",
    ariaLater: "Come\u00E7ar mais tarde",
    statHydration: "Hidrata\u00E7\u00E3o",
    statOven: "Forno",
    statCookTime: "Coc\u00E7\u00E3o",
    statFermentation: "Fermenta\u00E7\u00E3o",
    statTempSuffix: "a {t}\u00B0C",
    nerdTitle: "Dados t\u00E9cnicos",
    nerdFlourW: "Farinha W",
    nerdPL: "P/L",
    nerdYeast: "Fermento",
    nerdHoursAt18: "Hrs @18\u00B0C",
    nerdQ10: "Q\u2081\u2080",
    nerdAw: "Aw",
    seconds: "segundos",
    minutes: "minutos",
    minute: "minuto",
    hours: "horas",
    hour: "hora",
    recipeScore: "Pontua\u00E7\u00E3o da receita",
    nerdToggle: "PizzaNerd",
    nerdActive: "Ativar PizzaNerd",
    scienceTitle: "Vulcan Science",
    ariaCloseScores: "Fechar painel de pontua\u00E7\u00F5es",
    ariaViewScores: "Ver detalhes da pontua\u00E7\u00E3o",
    tapForDetails: "Toque para detalhes",
    styleEditorActive: "Style Editor ativo",
    cmsActive: "CMS ativo",
    fieldsModified: "campos modificados",
    fieldModified: "campo modificado",
    editOven: "Editar forno",
    weatherCity: "A sua cidade",
    weatherOutdoor: "{t}\u00B0C l\u00E1 fora",
    weatherKitchen: "Temperatura cozinha",
    badgeIdeal: "IDEAL",
    badgeRecent: "RECENTE",
    autoLabel: "Auto",
    cancel: "Cancelar",
    changeOven: "Mudar",
    ovenFallback: "Forno",
    pantryFlours: "Farinhas",
    pantryYeasts: "Fermentos",
    equipMixer: "Batedeira",
    equipStone: "Pedra refrat\u00E1ria",
    equipSteel: "Placa de a\u00E7o",
    equipPan: "Assadeira",
    equipKneading: "Sova",
    equipSurface: "Superfície de cocção",
    kitchenTitle: "Sua cozinha",
    pantryOptional: "opcional",
    specialFlours: "Farinhas especiais",
    brandSuggest: "Conhece a marca?",
    badgeSelected: "Selecionada",
    otherCompatibleFlours: "Outras farinhas compatíveis",
    flourSelectHint:
      "Selecione uma farinha para atualizar automaticamente W e P/L da receita.",
    flourSelected: "Aplicada",
    autolysisSuggested: "Autólise recomendada",
    dietGlutenFree: "Sem gl\u00FAten",
    dietLactoseFree: "Sem lactose",
    dietVegan: "Vegano",
    dietLowFodmap: "Baixo FODMAP",
    dietHistamine: "Baixa histamina",
    dietNickel: "Baixo níquel",
  },
  tips: {
    timeSlot:
      "A temperatura da cozinha influencia os tempos de fermenta\u00E7\u00E3o. Quanto mais tempo voc\u00EA tem, mais op\u00E7\u00F5es para massas leves e digest\u00EDveis.",
    skill:
      "Vamos ajustar a complexidade da receita ao seu n\u00EDvel de experi\u00EAncia.",
    equipment:
      "Uma pedra ou a\u00E7o mudam a crosta. A assadeira \u00E9 essencial para estilos como Teglia Romana ou Detroit.",
    oven: "A temperatura m\u00E1xima do seu forno determina quais estilos voc\u00EA pode reproduzir em casa.",
    pantry:
      "Vamos adaptar a receita \u00E0 sua despensa real: farinha compat\u00EDvel e tipo de fermento.",
  },
  hero: {
    title_line1: "A sua",
    title_line2: "pizza perfeita.",
    subtitle:
      "Conte-nos o que tem e vamos gui\u00E1-lo ao estilo ideal.",
  },
  steps: {
    context: {
      number: "01 \u2014 Contexto",
      title: "Quando & onde",
      subtitle: "Tempo, temperatura, ambiente",
    },
    setup: {
      number: "02 \u2014 Setup",
      title: "A sua cozinha",
      subtitle: "Ferramentas, experi\u00EAncia, despensa",
    },
    styles: {
      number: "03 \u2014 Estilo",
      title: "Escolha o seu estilo",
      subtitle: "Selecionados para si",
    },
  },
  sections: {
    when: {
      title: "Quando quer pizza?",
      description:
        "Selecione o momento para calcular os tempos de fermenta\u00E7\u00E3o",
    },
    skill: {
      title: "N\u00EDvel de experi\u00EAncia",
      description:
        "Ajuda-nos a calibrar a complexidade das receitas",
    },
    oven: {
      title: "O seu forno",
      description: "Tipo e temperatura m\u00E1xima",
    },
    pantry: {
      title: "Despensa",
      description: "Farinhas e fermentos que tem em casa",
    },
    dietary: {
      title: "Necessidades alimentares",
      description: "Filtros opcionais",
    },
    equipment: {
      title: "Equipamento",
      description: "O que tem na sua cozinha",
    },
  },
  timeSlots: {
    tonight: {
      label: "Hoje \u00E0 noite",
      sublabel: "4\u20136 horas",
      emoji: "\u{1F319}",
      hours: 5,
    },
    tomorrow_lunch: {
      label: "Amanh\u00E3 almo\u00E7o",
      sublabel: "16\u201320 horas",
      emoji: "\u2600\uFE0F",
      hours: 18,
    },
    tomorrow_dinner: {
      label: "Amanh\u00E3 jantar",
      sublabel: "24\u201328 horas",
      emoji: "\u{1F306}",
      hours: 26,
    },
    day_after: {
      label: "Depois de amanh\u00E3",
      sublabel: "40\u201348 horas",
      emoji: "\u{1F4C5}",
      hours: 44,
    },
    weekend: {
      label: "Fim de semana",
      sublabel: "72+ horas",
      emoji: "\u{1F389}",
      hours: 72,
    },
  },
  ovenPresets: {
    home: {
      name: "Forno dom\u00E9stico",
      maxTemp: 250,
      icon: "home",
    },
    electric_standard: {
      name: "El\u00E9trico standard",
      maxTemp: 300,
      icon: "zap",
    },
    gas: {
      name: "G\u00E1s profissional",
      maxTemp: 350,
      icon: "flame",
    },
    electric_high: {
      name: "El\u00E9trico alta temp.",
      maxTemp: 450,
      icon: "thermometer",
    },
    wood: {
      name: "Forno a lenha",
      maxTemp: 500,
      icon: "flame-kindling",
    },
  },
  skillLevels: {
    "1": {
      name: "Iniciante",
      description: "Primeiras experi\u00EAncias com pizza",
    },
    "2": {
      name: "Intermedi\u00E1rio",
      description: "J\u00E1 fiz pizza v\u00E1rias vezes",
    },
    "3": {
      name: "Avan\u00E7ado",
      description:
        "Conhe\u00E7o as t\u00E9cnicas e par\u00E2metros",
    },
    "4": {
      name: "Especialista",
      description: "Dom\u00EDnio completo das t\u00E9cnicas",
    },
  },
  families: {
    napoletana: {
      name: "Napolitana",
      description:
        "Leveza, fermenta\u00E7\u00E3o natural, coc\u00E7\u00E3o ultra-r\u00E1pida a calor extremo",
      emoji: "\u{1F1EE}\u{1F1F9}",
    },
    romana: {
      name: "Romana",
      description:
        "Da crocância extrema da Scrocchiarella \u00E0 alta hidrata\u00E7\u00E3o da Teglia",
      emoji: "\u{1F3DB}\uFE0F",
    },
    americana: {
      name: "Americana",
      description:
        "Adapta\u00E7\u00E3o \u00EDtalo-americana: praticidade, street food, variedade regional",
      emoji: "\u{1F5FD}",
    },
    contemporanea: {
      name: "Contempor\u00E2nea",
      description:
        "Digestibilidade, experimenta\u00E7\u00E3o, alta hidrata\u00E7\u00E3o, t\u00E9cnicas avan\u00E7adas",
      emoji: "\u{1F52C}",
    },
  },
  allFamiliesLabel: "Todas as fam\u00EDlias",
  tiers: {
    perfect: {
      label: "Perfeitos",
      subtitle: "compatibilidade m\u00E1xima",
    },
    good: { label: "Bons", subtitle: "\u00F3tima escolha" },
    challenging: {
      label: "Desafiantes",
      subtitle: "para os corajosos",
    },
  },
  scoreDimensions: {
    authenticity: {
      label: "Autenticidade",
      short: "Aut",
      weight: 0.3,
    },
    feasibility: {
      label: "Viabilidade",
      short: "Via",
      weight: 0.25,
    },
    digestibility: {
      label: "Digestibilidade",
      short: "Dig",
      weight: 0.2,
    },
    sustainability: {
      label: "Sustentabilidade",
      short: "Sus",
      weight: 0.15,
    },
    experimentation: {
      label: "Experimenta\u00E7\u00E3o",
      short: "Exp",
      weight: 0.1,
    },
  },
  recommendationWeights: {
    time: 0.25,
    oven: 0.25,
    skill: 0.2,
    equipment: 0.1,
    pantry: 0.2,
  },
  media: {
    stylePhotos: {
      napoletana_stg:
        "https://images.unsplash.com/photo-1717883235373-ef10b2a745a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      napoletana_canotto:
        "https://images.unsplash.com/photo-1770670644186-b3d930f75f5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      teglia_romana:
        "https://images.unsplash.com/photo-1650327381366-c6dc88f8b9fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      tonda_romana:
        "https://images.unsplash.com/photo-1695457207327-2fe494a5aab8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      pinsa_romana:
        "https://images.unsplash.com/photo-1602658015824-b49d35094837?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      new_york:
        "https://images.unsplash.com/photo-1616141032335-7e6b413f93ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      detroit:
        "https://images.unsplash.com/photo-1684823906761-30fd02a961cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      chicago_deep:
        "https://images.unsplash.com/photo-1595378833483-c995dbe4d74f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      bonci_teglia:
        "https://images.unsplash.com/photo-1624323210664-3659370c9346?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      focaccia_genovese:
        "https://images.unsplash.com/photo-1770833047669-2db01dd791e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      sfincione:
        "https://images.unsplash.com/photo-1711805064484-a77096f599a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      pala_romana:
        "https://images.unsplash.com/photo-1614936686354-a490b8d90478?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      grandma_style:
        "https://images.unsplash.com/photo-1601387448308-66ae6aa1f1f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      focaccia_recco:
        "https://images.unsplash.com/photo-1751183295754-9cff9577a44e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
      padellino_torino:
        "https://images.unsplash.com/photo-1626108962941-61b46dd705a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
    },
    fallbackPhoto:
      "https://images.unsplash.com/photo-1717883235373-ef10b2a745a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
  },
  result: {
    breadcrumb: "A sua pizza perfeita",
    heading: "Aqui est\u00E1 a sua receita",
    backLabel: "Voltar \u00E0 sele\u00E7\u00E3o",
  },
  yeastLabels: {
    fresh: "Fermento fresco",
    dry: "Fermento seco",
    sourdough: "Levain natural",
  },
  yeastDetails: {
    fresh: "Cubo cl\u00E1ssico",
    dry: "Pr\u00E1tico, longa conserva\u00E7\u00E3o",
    sourdough: "Sabor complexo, longa matura\u00E7\u00E3o",
  },
  flourLabels: {
    "00": "Farinha 00",
    "0": "Farinha 0",
    manitoba: "Manitoba (for\u00E7a)",
    integrale: "Integral",
    semola: "S\u00EAmola",
  },
  flourDetails: {
    "00": "Cl\u00E1ssica, vers\u00E1til",
    "0": "For\u00E7a m\u00E9dia",
    manitoba: "Alta for\u00E7a, longa matura\u00E7\u00E3o",
    integrale: "Mais fibra e sabor",
    semola: "Crocante, cor dourada",
  },
  filters: {
    advancedLabel: "Filtros avan\u00E7ados",
    removeFilters: "Remover filtros avan\u00E7ados",
    brandedFlours: "Farinhas de marca",
    settingsOpen: "Configura\u00E7\u00F5es",
    settingsClosed: "Suas configura\u00E7\u00F5es",
    hydrationLabel: "\uD83D\uDCA7 Hidrata\u00E7\u00E3o",
    hydrationLow: "Baixa <60%",
    hydrationMedium: "M\u00E9dia 60-70%",
    hydrationHigh: "Alta 70-85%",
    hydrationExtreme: "Extrema >85%",
    textureLabel: "\uD83C\uDFAF Textura",
    textureCrispyThin: "Fina crocante",
    textureThickAiry: "Alta fofa",
    textureAiryCrumb: "Alveolada",
    textureDeepDish: "Deep dish",
    skillLabel: "\uD83D\uDC68\u200D\uD83C\uDF73 N\u00EDvel",
    skillBeginner: "Iniciante",
    skillIntermediate: "Intermedi\u00E1rio",
    skillAdvanced: "Avan\u00E7ado",
    skillExpert: "Especialista",
    ovenLabel: "\uD83D\uDD25 Coc\u00E7\u00E3o",
    ovenHome: "Forno caseiro",
    ovenWood: "Lenha",
    ovenElectricHigh: "El\u00E9trico >350\u00B0C",
    ovenPan: "Frigideira",
  },
  glossary: {
    pageTitle: "Gloss\u00E1rio T\u00E9cnico",
    searchPlaceholder:
      "Buscar termo, s\u00EDmbolo ou defini\u00E7\u00E3o...",
    cancelSearch: "Limpar",
    noResults: 'Nenhum termo encontrado para "{query}"',
    allCategories: "Todos",
    formulaLabel: "F\u00F3rmula",
    rangesLabel: "Faixas t\u00EDpicas",
    whyImportantLabel: "Por que importa",
    relatedLabel: "Relacionados",
    backToHome: "Voltar ao in\u00EDcio",
    termCount: "{count} termos",
    catRheology: "Reologia",
    catRheologyDesc:
      "Propriedades mec\u00E2nicas da farinha e da massa",
    catFermentation: "Fermenta\u00E7\u00E3o",
    catFermentationDesc:
      "Levedura, matura\u00E7\u00E3o e processos biol\u00F3gicos",
    catThermal: "T\u00E9rmica",
    catThermalDesc: "Transfer\u00EAncia de calor e cozimento",
    catChemistry: "Qu\u00EDmica",
    catChemistryDesc:
      "Composi\u00E7\u00E3o e rea\u00E7\u00F5es qu\u00EDmicas",
    catMechanics: "Mec\u00E2nica",
    catMechanicsDesc: "Processamento, equipamentos e medidas",
    catScoring: "Pontua\u00E7\u00F5es",
    catScoringDesc: "M\u00E9tricas de qualidade Vulcan",
  },
  engineMessages: {
    "auth.hydrationOff":
      "Hidratação fora do centro (-{penalty}%)",
    "auth.wOutOfRange":
      "W da farinha fora do intervalo (-{penalty}%)",
    "auth.plOutOfRange":
      "P/L {pl} fora do intervalo {plMin}-{plMax} (-{penalty}%)",
    "auth.notWoodOven": "Não é forno a lenha (-15%)",
    "auth.tempVsIdeal":
      "Temperatura {temp}°C vs {ideal}°C (-{penalty}%)",
    "auth.tempBelowMin":
      "Temperatura abaixo do mínimo (-{penalty}%)",
    "auth.fermentTooShort":
      "Fermentação muito curta (-{penalty}%)",
    "auth.fermentTooLong":
      "Fermentação muito longa (-{penalty}%)",
    "feas.ovenSuboptimal":
      "Forno sub-ótimo: {temp}°C vs ideal {ideal}°C",
    "feas.ovenTooCold":
      "Forno muito frio: {temp}°C < mínimo {min}°C",
    "feas.wTooLow": "W muito baixo: {w} < {wMin}",
    "feas.wTooHigh": "W muito alto ({w}). Massa tenaz.",
    "feas.hydrationBeginnerHigh":
      "Hidratação >75% não recomendada para iniciantes",
    "feas.hydrationNeedsPractice":
      "Hidratação alta requer prática",
    "feas.hydrationMedBeginner":
      "Hidratação média-alta para iniciante",
    "feas.flourTooWeakForHydration":
      "Farinha muito fraca para esta hidratação",
    "feas.prefermentNeedsExperience":
      "Pré-fermento requer experiência",
    "dig.fermentTooShort":
      "Fermentação muito curta: amidos não degradados",
    "dig.fermentShort":
      "Fermentação curta: digestibilidade limitada",
    "dig.fodmapReduced": "FODMAPs reduzidos ~{pct}%",
    "dig.fodmapHighReduction": "FODMAPs reduzidos >80%",
    "dig.extremeMaturation":
      "Maturação extrema: máxima complexidade aromática",
    "dig.highYeastDosage":
      "Dosagem alta de fermento ({pct}%): -{penalty}% digestibilidade",
    "dig.coldFermentation":
      "Fermentação fria: atividade enzimática ótima",
    "sust.quickCook":
      "Cozimento rápido: baixo consumo energético",
    "sust.longCook": "Cozimento longo: alto consumo energético",
    "sust.ambientFerment":
      "Fermentação em temperatura ambiente: sem gasto de geladeira",
    "sust.pureDough":
      "Massa pura: apenas farinha, água, sal, fermento",
    "sust.sourdoughZeroImpact":
      "Levain: feito em casa, impacto zero",
    "rec.timeCompatible":
      "Fermentação {fMin}-{fMax}h: compatível com seu tempo",
    "rec.timeAdaptable": "Fermentação adaptável a ~{hours}h",
    "rec.timeInsufficient":
      "Requer mínimo {fMin}h, você tem {available}h",
    "rec.needsWoodOven": "Requer forno a lenha",
    "rec.ovenIdeal":
      "Seu forno atinge a temperatura ideal ({ideal}°C)",
    "rec.ovenAdequate":
      "Forno adequado (compensação automática tempo/temperatura)",
    "rec.ovenTooCold":
      "Forno muito frio: {temp}°C < min {min}°C",
    "rec.skillMatch": "Adequado ao seu nível",
    "rec.skillExpert": "Seu nível permite qualquer estilo",
    "rec.hydrationNeedsPractice":
      "Hidratação alta requer prática",
    "rec.advancedForBeginner":
      "Estilo avançado para iniciantes",
    "rec.noKneadNoMixer":
      "Não precisa de amassadeira (no-knead)",
    "rec.handsHighHydration":
      "Hidratação alta: amassar à mão muito difícil",
    "rec.handsMedHydration":
      "Hidratação média-alta: amassar à mão requer prática",
    "rec.forkIdealHighH":
      "Amassadeira de garfo ideal para alta hidratação",
    "rec.forkLowFriction":
      "Amassadeira de garfo: baixo atrito térmico",
    "rec.spiralOptimal":
      "Espiral profissional: amassamento ótimo",
    "rec.domesticStrugglesHighH":
      "Amassadeira doméstica: pode falhar com hidratação >80%",
    "rec.mixerHelps": "Sua amassadeira facilita o processo",
    "rec.mixerRecommended":
      "Hidratação alta: amassadeira recomendada",
    "rec.castIronPerfect":
      "Ferro fundido perfeito para este estilo",
    "rec.panFits": "Forma adequada para este estilo",
    "rec.needsPan": "Forma necessária para este estilo",
    "rec.refractoryIdeal":
      "Pedra refratária: ideal para a napolitana",
    "rec.steelPlateCrispy":
      "Placa de aço: base crocante em segundos",
    "rec.panPerfect": "Sua forma é perfeita para este estilo",
    "rec.flourMatch": "Farinha em estoque compatível",
    "rec.flourPartial":
      "Farinha parcialmente adequada (W não ideal)",
    "rec.flourNoMatch":
      "Nenhuma farinha em estoque no intervalo W necessário",
    "rec.sourdoughLongFerment":
      "Levain ideal para maturação longa",
    "rec.sourdoughOnlyShort":
      "Apenas levain: fermentação curta difícil",
    "tip.waterTempCold":
      "Regra dos 55: use água da geladeira ({temp}°C). A amassadeira aquece a massa.",
    "tip.waterTempNormal":
      "Regra dos 55: use água a {temp}°C para atingir {ddt}°C de temperatura da massa.",
    "tip.frictionNote":
      "Compensação de atrito da amassadeira: {friction}°C",
  },
  scienceLabels: {
    yeastBaker: "Fermento de padeiro",
    effectiveHours: "Horas efetivas",
    q10Factor: "Fator Q\u2081\u2080",
    q10Cold: "frio",
    q10Sourdough: "massa m\u00E3e",
    q10Standard: "padr\u00E3o",
    waterActivity: "Atividade de \u00E1gua",
    glutenNetwork: "Rede de gl\u00FAten",
    proteolysis: "Prote\u00F3lise",
    starchDegradation: "Degrada\u00E7\u00E3o amido",
    fodmapReduction: "Redu\u00E7\u00E3o FODMAP",
    plEstimated: "P/L estimado",
    bakingEnergy: "Energia de coc\u00E7\u00E3o",
    waterTemp: "Temperatura da \u00E1gua",
    desiredDoughTemp: "Temperatura da massa",
    frictionFactor: "Fator de atrito",
    deviationCategory: "Desvio",
    deviationScore: "Dev. efetivo",
  },
  timelineLabels: {
    preferment: {
      title: "Pr\u00E9-Fermento",
      desc: "Misturar {type} e deixar maturar",
      tipBeginner:
        'O pr\u00E9-fermento \u00E9 como um "aperitivo" para o fermento. Misture e deixe repousar coberto.',
      tipNerd:
        "O pr\u00E9-fermento produz \u00E1cidos org\u00E2nicos (l\u00E1tico/ac\u00E9tico) que baixam o pH para ~4,5, melhorando a rede de gl\u00FAten.",
    },
    mix: {
      title: "Amassamento",
      desc: "Amassar at\u00E9 ficar liso e el\u00E1stico.",
      descAlt:
        "Misturar os ingredientes sem amassar. S\u00E9rie de dobras.",
      tipBeginner:
        "A massa est\u00E1 pronta quando est\u00E1 lisa e se solta das m\u00E3os. Se grudar muito, espere 5 min e tente novamente.",
      tipNerd:
        "O teste do v\u00E9u confirma o desenvolvimento do gl\u00FAten: glutenina e gliadina formam pontes dissulfeto est\u00E1veis.",
    },
    mix_noknead: {
      title: "Mistura",
      desc: "Misturar os ingredientes sem amassar. S\u00E9rie de dobras.",
      tipBeginner:
        "N\u00E3o precisa amassar! Misture com uma esp\u00E1tula at\u00E9 n\u00E3o sobrar farinha seca.",
      tipNerd:
        "A aut\u00F3lise aproveita as proteinases end\u00F3genas da farinha para desenvolver o gl\u00FAten sem trabalho mec\u00E2nico.",
    },
    bulk: {
      title: "Fermenta\u00E7\u00E3o em massa",
      desc: "Fermenta\u00E7\u00E3o em massa a {temp}\u00B0C",
      tipBeginner:
        "A massa deve duplicar de volume. Se estiver quente, verifique mais vezes!",
      tipNerd:
        "A {temp}\u00B0C a velocidade de fermenta\u00E7\u00E3o \u00E9 {factor}\u00D7 em rela\u00E7\u00E3o \u00E0 refer\u00EAncia de 18\u00B0C.",
    },
    bulk_cold: {
      title: "Fermenta\u00E7\u00E3o em massa",
      desc: "Fermenta\u00E7\u00E3o em massa a {temp}\u00B0C",
      tipBeginner:
        "Na geladeira a massa cresce devagar mas ganha sabor. Cubra bem com filme em contacto.",
      tipNerd:
        "A {temp}\u00B0C o Q\u2081\u2080\u22482,0 desacelera a fermenta\u00E7\u00E3o. A atividade proteol\u00EDtica domina, degradando os FODMAP.",
    },
    divide: {
      title: "Divis\u00E3o",
      desc: "Dividir em bolas do peso correto. Formar bola.",
      tipBeginner:
        "Use uma balan\u00E7a! Corte com um raspador e arredonde cada peda\u00E7o numa bola lisa.",
      tipNerd:
        "A divis\u00E3o cria tens\u00E3o superficial que aprisiona CO\u2082 durante o descanso final.",
    },
    proof: {
      title: "Descanso final",
      desc: "Fermenta\u00E7\u00E3o final a {temp}\u00B0C",
      tipBeginner:
        "As bolas devem estar macias. Se pressionar com o dedo, voltam lentamente.",
      tipNerd:
        "Teste do dedo: retorno lento = fermenta\u00E7\u00E3o \u00F3tima. Muito r\u00E1pido = sub-fermentado. Sem retorno = sobre-fermentado.",
    },
    shape: {
      title: "Abertura",
      desc: "Abrir com as m\u00E3os a partir do centro, preservar a borda",
      descAlt: "Esticar na assadeira untada com as m\u00E3os",
    },
    shape_thin: {
      title: "Abertura",
      desc: "Abrir com rolo, ultrafina",
    },
    top: { title: "Cobertura", desc: "Cobrir a pizza a gosto" },
    bake: {
      title: "Coc\u00E7\u00E3o",
      desc: "Assar a {temp}\u00B0C",
      tipBeginner:
        "O forno deve estar muito quente. Pr\u00E9-aquecer pelo menos 30 minutos antes.",
      tipNerd:
        "A rea\u00E7\u00E3o de Maillard come\u00E7a a ~140\u00B0C e acelera exponencialmente. A {temp}\u00B0C a carameliza\u00E7\u00E3o cria ~600 compostos arom\u00E1ticos.",
    },
  },
  timelineUi: {
    startLabel: "In\u00EDcio",
    beforeSuffix: "antes",
  },
  parametricTips: {
    pillHydration: "Hidrata\u00E7\u00E3o",
    pillFlour: "Farinha",
    pillPL: "P/L",
    pillFermentation: "Fermenta\u00E7\u00E3o",
    pillThickness: "Espessura",
    pillLevel: "N\u00EDvel",
    pillExperimentation: "Experimenta\u00E7\u00E3o",
    pillLevelBeginner: "Iniciante",
    pillLevelExpert: "Especialista",
    sheetSectionTitle: "Detalhes de cozimento",
    sheetOvenLabel: "Forno ideal",
    sheetOvenPreheat: "Pr\u00E9-aquecimento: {min} min",
    sheetBakeLabel: "Tempo de cozimento",
    sheetBakeTurns: "{n} rota\u00E7\u00E3o(\u00F5es)",
    sheetBakeNoTurns: "Sem rota\u00E7\u00E3o",
    sheetDoughLabel: "Bola de massa",
    sheetSaltLabel: "Sal",
    sheetFoldLabel: "Dobras",
    sheetFoldInterval: "A cada {min} min",
    sheetGenerateBtn: "Gerar receita",
    sheetTechniquesLabel:
      "T\u00E9cnicas de autor compat\u00EDveis",
    mixBeginner: "{mixer} (~{time} min de sova). {equipment}",
    bulkBeginner:
      "Fa\u00E7a {count} dobras ({type}) a cada {interval} minutos para desenvolver a estrutura.",
    shapeBeginner: "{note}",
    topBeginner: "Ordem: {order}. {note}",
    bakeBeginner: "Tempo: {minM}\u2013{maxM} min. {turnsNote}",
    mixNerd: "{mixer} \u00B7 sova ~{time} min \u00B7 {note}",
    bulkNerd:
      "Dobras: {count}\u00D7 {type} a cada {interval} min \u00B7 {note}",
    shapeNerd:
      "Cortes: {type} \u00B7 profundidade {depth}mm \u00B7 {timing} \u00B7 {note}",
    topNerd:
      "Ordem cobertura: {order} \u00B7 molho {saucePos} \u00B7 {cheeseType} ({cheesePos}) \u00B7 {note}",
    bakeNerd:
      "Cozimento ideal: {idealSec}s (faixa {minM}\u2013{maxM} min) \u00B7 {turns} rota\u00E7\u00F5es \u00B7 {note}",
    mixerPlanetaria: "Batedeira planet\u00E1ria recomendada",
    mixerHand: "Sova manual poss\u00EDvel",
    turnsSingle: "Girar {n} vez(es) para cozimento uniforme.",
    turnsNone: "N\u00E3o girar durante o cozimento.",
  },
  styleDescriptions: {
    napoletana_stg:
      "Padr\u00E3o ouro segundo regulamento AVPN. Borda inchada, centro fino, crosta leopardo.",
    napoletana_canotto:
      'Borda explosiva "canotto de ar", alveolagem extrema, alta digestibilidade.',
    teglia_romana:
      "Alta hidrata\u00E7\u00E3o, sem sovar com dobras. Base crocante, miolo nuvem.",
    tonda_romana:
      'Ultrafina, rolo obrigat\u00F3rio, crocante extrema. "Scrocchiarella".',
    pinsa_romana:
      "Mistura 70% trigo / 15% soja / 15% arroz. Forma oval, crosta v\u00EDtrea.",
    pala_romana:
      "Formato oval alongado servido na p\u00E1. Meio-termo entre redonda e assadeira: crocante fora, nuvem dentro.",
    new_york:
      "Fatia grande dobr\u00E1vel, crosta crocante mas flex\u00EDvel. Street food.",
    detroit:
      "Coroa de queijo crocante, assadeira Blue Steel. Queijo at\u00E9 as bordas.",
    chicago_deep:
      "Pizza profunda como torta salgada. Camadas invertidas: queijo-recheio-molho.",
    bonci_teglia:
      "Sem sovar com dobras, hidrata\u00E7\u00E3o extrema, mestre Bonci. Alta digestibilidade.",
    focaccia_genovese:
      "Macia e oleosa, com crosta dourada e crateras caracter\u00EDsticas. Salmoura \u00F3leo-\u00E1gua na superf\u00EDcie.",
    sfincione:
      "Pizza grossa siciliana com tomate, cebola, anchovas, caciocavallo e farinha de rosca. Street food de Palermo.",
    grandma_style:
      "Fina, crocante, assadeira untada. A pizza da av\u00F3 \u00EDtalo-americana. Mussarela embaixo, molho em cima.",
    focaccia_recco:
      "Duas folhas ultrafinas com stracchino derretido. IGP desde 2015. Bolhas douradas caracter\u00EDsticas.",
    padellino_torino:
      "Assada em frigideira de ferro e finalizada no forno. Fundo crocante manteiga-\u00F3leo, macia no centro. Especialidade turinesa.",
  },
  styleChars: {
    napoletana_stg:
      "Borda 1-2cm inchada|Centro 3-4mm fino|Crosta leopardo|Cozimento 60-90s",
    napoletana_canotto:
      'Borda 3-4cm "canotto"|Alveolagem extrema|Matura\u00E7\u00E3o 24-72h|Alta digestibilidade',
    teglia_romana:
      "Altura 2-3cm|Hidrata\u00E7\u00E3o 80-100%|Sem sovar + dobras|Miolo nuvem",
    tonda_romana:
      "Espessura 1-2mm|Rolo obrigat\u00F3rio|Crocante extrema|Farinha fraca W<210",
    pinsa_romana:
      "Mix multi-cereais|Forma oval|Crosta v\u00EDtrea|Matura\u00E7\u00E3o 24-72h",
    pala_romana:
      "Forma oval alongada|Alta hidrata\u00E7\u00E3o|Servida na p\u00E1|Crosta crocante-nuvem",
    new_york:
      "Fatia dobr\u00E1vel|A\u00E7\u00FAcar + \u00F3leo|Cozimento 12-15min|Oleosidade caracter\u00EDstica",
    detroit:
      "Coroa de queijo|Assadeira profunda|Queijo nas bordas|Crosta caramelizada",
    chicago_deep:
      "Profundidade 5cm|Manteiga 18%|Camadas invertidas|Cozimento 35min",
    bonci_teglia:
      "Sem sovar + dobras|Hidrata\u00E7\u00E3o extrema|Matura\u00E7\u00E3o 24-72h|Alveolagem nuvem",
    focaccia_genovese:
      "\u00D3leo EVO generoso|Crateras superficiais|Salmoura \u00F3leo-\u00E1gua|Cozimento 15-20min",
    sfincione:
      "Grosso e macio|Farinha de rosca tostada|Cebola + anchovas|Caciocavallo",
    grandma_style:
      "Fina e crocante|Mussarela sob molho|Assadeira bem untada|Cozimento 12-16min",
    focaccia_recco:
      "Folha quase transparente|Recheada de stracchino|Bolhas douradas|Sem fermenta\u00E7\u00E3o",
    padellino_torino:
      "Frigideira de ferro|Fundo ultra-crocante|Macia no centro|Por\u00E7\u00E3o individual",
  },
  deviationLabels: {
    canonical: "Can\u00F4nico",
    parameter_variant: "Varia\u00E7\u00E3o param\u00E9trica",
    technique_variant: "Variante t\u00E9cnica",
    hybrid: "Hibrida\u00E7\u00E3o",
    experimental: "Experimental",
  },
  authorNames: {
    bonci_no_knead: "Sem Sova Alta Hidrata\u00E7\u00E3o",
    martucci_biga_ibrida:
      "Biga H\u00EDbrida 50% + Aut\u00F3lise",
    martucci_biga_100: "Biga 100% com Refresco",
    pepe_sensoriale: "Hidrata\u00E7\u00E3o Sensorial",
    bosco_idrolisi:
      "M\u00E9todo Hidr\u00F3lise (Fermenta\u00E7\u00E3o Espont\u00E2nea)",
    capuano_forbici: "M\u00E9todo Tesoura (Laticínios)",
    pepe_sensory_layering:
      "Cozimento Separado dos Ingredientes",
    bianco_long_ferment: "Fermentação 5 Dias",
    forkish_saturday: "Pizza de Sábado (Fermentação a Frio)",
  },
  authorAuthors: {
    bonci_no_knead: "Gabriele Bonci",
    martucci_biga_ibrida: "Francesco Martucci",
    martucci_biga_100: "Francesco Martucci",
    pepe_sensoriale: "Franco Pepe",
    bosco_idrolisi: "Renato Bosco",
    capuano_forbici: "Vincenzo Capuano",
    pepe_sensory_layering: "Franco Pepe",
    bianco_long_ferment: "Chris Bianco",
    forkish_saturday: "Ken Forkish",
  },
  profile: {
    pageTitle: "Seu Perfil",
    pageSubtitle: "Suas preferências, sempre à mão.",
    ovenTitle: "Seu forno",
    ovenSubtitle:
      "Determina temperaturas e estilos disponíveis",
    ovenStep: "01 — Equipamento",
    tempLabel: "Temperatura máxima",
    tempAria: "Temperatura máxima do forno",
    skillTitle: "Sua experiência",
    skillSubtitle: "Adaptamos a complexidade das receitas",
    skillStep: "02 — Nível",
    pantryTitle: "Sua despensa",
    pantrySubtitle: "Farinhas e fermentos que você tem em casa",
    pantryStep: "03 — Ingredientes",
    dietTitle: "Preferências alimentares",
    dietSubtitle: "Filtre estilos e ingredientes incompatíveis",
    dietStep: "04 — Dieta",
    noDietNote:
      "Sem restrições — todos os estilos disponíveis.",
    prefsTitle: "Idioma e tema",
    prefsSubtitle: "Personalize a interface",
    prefsStep: "05 — Preferências",
    langLabel: "Idioma",
    themeLabel: "Tema",
    themeLight: "Claro",
    themeDark: "Escuro",
    resetProfile: "Reconfigurar perfil",
    devModeOn: "Modo desenvolvimento ativo",
    devModeOff: "Ativar modo desenvolvimento",
    ftuWelcome: "Bem-vindo",
    ftuOvenTitle: "Que forno você tem?",
    ftuOvenSubtitle: "O forno define os estilos possíveis",
    ftuSkillTitle: "Quanta experiência?",
    ftuSkillSubtitle: "Vamos guiá-lo no nível certo",
    ftuPantryTitle: "O que tem na sua despensa?",
    ftuPantrySubtitle: "Farinhas e fermentos disponíveis",
    ftuBack: "Voltar",
    ftuNext: "Próximo",
    ftuStart: "Começar",
    localeModalTitle: "Mudar idioma?",
    localeModalDesc:
      "Todos os textos da interface mudarão de {from} para {to}.",
    localeModalCancel: "Cancelar",
    localeModalConfirm: "Confirmar",
    flour00: "Tipo 00",
    flour0: "Tipo 0",
    flourManitoba: "Manitoba",
    flourIntegrale: "Integral",
    flourSemola: "S\u00EAmola de trigo duro",
    yeastFresh: "Fermento fresco",
    yeastDry: "Fermento seco",
    yeastSourdough: "Fermento natural",
    dietGlutenFree: "Sem gl\u00FAten",
    dietLactoseFree: "Sem lactose",
    dietVegan: "Vegano",
    dietLowFodmap: "Low FODMAP",
    dietHistamine: "Baixa histamina",
    dietNickel: "Baixo n\u00EDquel",
    equipTitle: "Equipamento",
    equipSubtitle: "O que você tem na cozinha",
    equipStep: "03 — Equipamento",
    equipMixerTitle: "Amassamento",
    equipSurfaceTitle: "Superfície de cocção",
    equipToolsTitle: "Utensílios",
    equipSummaryNone: "Não selecionado",
    equipSummarySelected: "{count} selecionados",
    mixerHands: "À mão",
    mixerHandsDesc: "Amassamento manual, sem equipamento",
    mixerStandDomestic: "Batedeira planetária (doméstica)",
    mixerStandDomesticDesc:
      "KitchenAid, Kenwood, Smeg — 4-7 L, gancho",
    mixerPlanetary: "Amassadeira planetária (semi-pro)",
    mixerPlanetaryDesc: "10-20 L, gancho espiral, motor 500W+",
    mixerSpiral: "Amassadeira espiral",
    mixerSpiralDesc: "Cuba fixa/basculante, profissional",
    mixerFork: "Amassadeira de garfo",
    mixerForkDesc:
      "Lenta, baixa fricção — ideal para alta hidratação",
    mixerLevelHome: "Casa",
    mixerLevelSemiPro: "Semi-Pro",
    mixerLevelPro: "Pro",
    surfaceRefractory: "Tijolo refratário",
    surfaceRefractoryDesc:
      "3 cm, alta massa térmica — forno a lenha e prosumer",
    surfaceCordierite: "Pedra de cordierita",
    surfaceCordieriteDesc:
      "1.5 cm, compromisso massa/velocidade — Effeuno, Ooni",
    surfaceSteel: "Placa de aço",
    surfaceSteelDesc:
      "5-10 mm, transferência ultra-rápida — base crocante em segundos",
    surfaceAluminum: "Forma de alumínio",
    surfaceAluminumDesc:
      "Leve, condutividade extrema — Detroit, teglia romana",
    surfaceBlueSteel: "Forma de aço azul",
    surfaceBlueSteelDesc:
      "Antiaderente natural, borda alta — teglia, focaccia",
    surfaceCastIron: "Frigideira de ferro fundido",
    surfaceCastIronDesc:
      "Alta massa térmica, borda alta — Chicago, padellino",
    surfaceOvenRack: "Grelha do forno",
    surfaceOvenRackDesc:
      "Sem superfície adicional — apenas grelha padrão",
    toolCatEssential: "Essenciais",
    toolCatPrecision: "Precisão",
    toolCatHandling: "Manuseio",
    toolCatContainment: "Armazenamento",
    toolDigitalScale: "Balança digital",
    toolDigitalScaleDesc: "Precisão 1g, capacidade 5kg+",
    toolThermometer: "Termômetro",
    toolThermometerDesc: "IR ou sonda, para massa e forno",
    toolScraper: "Raspador",
    toolScraperDesc: "Plástico flexível para dobras e corte",
    toolContainers: "Recipientes de fermentação",
    toolContainersDesc:
      "Bandejas empilháveis ou tigelas com tampa",
    toolDoughCutter: "Cortador de massa",
    toolDoughCutterDesc: "Inox, para porcionar com precisão",
    toolBenchKnife: "Espátula de bancada",
    toolBenchKnifeDesc:
      "Inox, para virar massas de alta hidratação",
    toolScoringBlade: "Lâmina de scoring",
    toolScoringBladeDesc:
      "Para incisões decorativas na superfície",
    toolPeelWood: "Pá de madeira",
    toolPeelWoodDesc:
      "Para colocar no forno — baixa fricção com semolina",
    toolPeelMetal: "Pá de alumínio",
    toolPeelMetalDesc: "Para girar e retirar — fina e reativa",
    toolPizzaScreen: "Tela perfurada",
    toolPizzaScreenDesc:
      "Alumínio perfurado para cozimento crocante",
    toolProofingBoxes: "Caixas de fermentação",
    toolProofingBoxesDesc:
      "Empilháveis com tampa — 30×40 ou 40×60 cm",
    toolBannetons: "Bannetons",
    toolBannetonsDesc:
      "Para formas redondas, com forro de linho",
  },
  pages: {
    navCreate: "Criar",
    navExplore: "Estilos",
    navLearn: "Aprender",
    navProfile: "Perfil",
    navSearch: "Buscar",
    exploreStepNum: "15 estilos \u2014 4 fam\u00EDlias",
    exploreTitle: "Explore os Estilos",
    exploreSubtitle:
      "Da Napoletana STG \u00E0 Focaccia di Recco.",
    learnTitle: "Aprenda",
    learnSubtitle:
      "A ci\u00EAncia e a arte da pizza, bem explicadas.",
    learnGlossary: "Gloss\u00E1rio",
    learnGlossaryDesc:
      "30+ termos t\u00E9cnicos de panifica\u00E7\u00E3o",
    learnTroubleshooting: "Problemas & Solu\u00E7\u00F5es",
    learnTroubleshootingDesc:
      "20 problemas comuns e como resolv\u00EA-los",
    learnPreFerments: "Pr\u00E9-fermentos",
    learnPreFermentsDesc:
      "Guia de Biga, Poolish e Aut\u00F3lise",
    recipeLabel: "Receita",
    recipeBackToStyles: "Estilos",
    recipeStyleNotFound: "Estilo n\u00E3o encontrado",
    recipeStyleNotFoundDesc:
      'O estilo "{id}" n\u00E3o existe no banco de dados.',
    recipeExploreStyles: "Explorar estilos",
    recipeCopyLinkAria: "Copiar link da receita",
    notFoundTitle: "P\u00E1gina n\u00E3o encontrada",
    notFoundSubtitle:
      "Essa pizza n\u00E3o existe no nosso card\u00E1pio.",
    notFoundBack: "Voltar ao in\u00EDcio",
    searchPlaceholder:
      "Buscar estilo, farinha, termo, problema\u2026",
    searchCatStyles: "Estilos",
    searchCatFlours: "Farinhas",
    searchCatGlossary: "Gloss\u00E1rio",
    searchCatProblems: "Problemas",
    searchCatGuides: "Guias",
    searchNoResults: 'Nenhum resultado para "{query}"',
    searchHint:
      "Digite para buscar estilos, farinhas, gloss\u00E1rio e problemas",
    searchSuggestions: "Sugest\u00F5es",
    searchFlourWheat: "Trigo brando",
    searchFlourManitoba: "Manitoba",
    searchFlourSemola: "S\u00EAmola",
    searchFlourWholegrain: "Integral",
    searchFlourGlutenFree: "Sem gl\u00FAten",
    searchFlourSpecial: "Especial",
    skipToContent: "Pular para o conte\u00FAdo",
    navMainLabel: "Navega\u00E7\u00E3o principal",
    searchCloseLabel: "Fechar pesquisa",
    searchFieldLabel: "Campo de pesquisa global",
    searchClearLabel: "Limpar pesquisa",
    dietaryWarningsTitle: "Avisos diet\u00E9ticos",
    troubleshootingTitle: "Problemas com a receita?",
    troubleshootingDesc:
      "Consulte o guia de 20 problemas comuns e solu\u00E7\u00F5es",
  },
  configurator: {
    hydrationLabel: "Hidrata\u00E7\u00E3o",
    hydrationTip:
      "Percentual de \u00E1gua em rela\u00E7\u00E3o \u00E0 farinha. Mais alta = massa mais macia e miolo aberto, mas mais dif\u00EDcil de manusear.",
    flourWLabel: "For\u00E7a da Farinha (W)",
    flourWTip:
      "Indica a capacidade de absorver \u00E1gua e reter g\u00E1s. W mais alto = fermenta\u00E7\u00F5es mais longas e estrutura mais forte.",
    plLabel: "Rela\u00E7\u00E3o P/L",
    plTip:
      "Rela\u00E7\u00E3o alveogr\u00E1fica tenacidade/extensibilidade. P/L baixo = massa extens\u00EDvel (pizza redonda). P/L alto = massa tenaz (fermenta\u00E7\u00E3o longa). Estimado a partir de W se n\u00E3o modificado.",
    fermentLabel: "Fermenta\u00E7\u00E3o",
    fermentTip:
      "Tempo total de fermenta\u00E7\u00E3o. Mais horas em temperaturas baixas = sabor mais complexo e melhor digestibilidade.",
    tempFridge: "4\u00B0C geladeira",
    tempCool: "12\u00B0C",
    tempAmbient: "22\u00B0C amb.",
    preFermentLabel: "Pr\u00E9-fermento",
    preFermentTip:
      "O pr\u00E9-fermento (biga, poolish) \u00E9 uma por\u00E7\u00E3o de massa fermentada com anteced\u00EAncia. Melhora sabor, digestibilidade e conserva\u00E7\u00E3o. Requer 12\u201324 h de planejamento extra.",
    ovenLabel: "Forno",
    ovenTip:
      "Selecione o tipo e ajuste a temperatura. Temperaturas mais altas = cozimento mais r\u00E1pido e melhor crosta.",
    panLabel: "Forma",
    panTipRect:
      "A forma e o tamanho da assadeira afetam a quantidade de massa e o resultado final. O padr\u00E3o para este estilo \u00E9 retangular.",
    panTipRound:
      "A forma e o tamanho da assadeira afetam a quantidade de massa e o resultado final. O padr\u00E3o para este estilo \u00E9 redonda.",
    panRectangular: "Retangular",
    panRound: "Redonda",
    panLength: "Comprimento",
    panWidth: "Largura",
    panDiameter: "Di\u00E2metro",
    panArea: "\u00C1rea da forma",
    thicknessLabel: "Espessura",
    thicknessTip:
      "A espessura da pizza afeta diretamente o peso da bola, o cozimento e a textura final. Valores baixos = fina e crocante. Valores altos = fofa e alta.",
    thicknessThin: "Fina e crocante",
    thicknessThick: "Alta e fofa",
    thicknessStandard: "Padr\u00E3o para este estilo",
    backLabel: "Voltar",
    sliderOptimal: "\u00F3timo",
  },
  preFerment: PRE_FERMENT_PT as any,
  dietaryI18n: DIETARY_PT as any,
  troubleshootingI18n: TROUBLESHOOTING_PT as any,
  glossaryTerms: GLOSSARY_TERMS_PT as any,
};