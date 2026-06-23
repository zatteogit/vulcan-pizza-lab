import type { CmsContent } from "../cms-context";
import { STYLE_PHOTOS } from "../../../data/style-photos";
import {
  PRE_FERMENT_JA,
  DIETARY_JA,
  TROUBLESHOOTING_JA,
  GLOSSARY_TERMS_JA,
} from "./domain-ja";

/**
 * Japanese locale bundle — complete CmsContent override.
 *
 * Convention: every locale file exports a full CmsContent object.
 * The CMS switchLocale() function deep-merges the locale bundle
 * into the defaults, so only text/label fields change —
 * numeric values (weights, maxTemp, hours) stay untouched.
 */
export const JA_LOCALE: CmsContent = {
  locale: {
    id: "ja",
    name: "\u65E5\u672C\u8A9E",
  },
  ui: {
    // Actions
    copy: "\u30B3\u30D4\u30FC",
    copied: "\u30B3\u30D4\u30FC\u3057\u307E\u3057\u305F\uFF01",
    share: "\u5171\u6709",
    back: "\u623B\u308B",
    reset: "\u30EA\u30BB\u30C3\u30C8",
    close: "\u9589\u3058\u308B",
    closeDetails: "\u8A73\u7D30\u3092\u9589\u3058\u308B",
    closeInsight: "\u9589\u3058\u308B",
    modify: "\u7DE8\u96C6",
    disable: "\u7121\u52B9\u5316",
    restore: "\u5FA9\u5143",
    generate: "\u30EC\u30B7\u30D4\u3092\u4F5C\u6210",
    chooseStyle: "\u30B9\u30BF\u30A4\u30EB\u3092\u9078\u3076",
    customizeParams:
      "\u30D1\u30E9\u30E1\u30FC\u30BF\u3092\u30AB\u30B9\u30BF\u30DE\u30A4\u30BA",
    changeStyle: "\u30B9\u30BF\u30A4\u30EB\u5909\u66F4",
    newPizza: "\u65B0\u3057\u3044\u30D4\u30B6",
    // Recipe output
    ingredients: "\u6750\u6599",
    procedure: "\u4F5C\u308A\u65B9",
    steps_count: "{n}\u30B9\u30C6\u30C3\u30D7",
    doughBalls: "\u751F\u5730\u7389",
    timeline: "タイムライン",
    doughBallsFrom: "\u5404{w}",
    totalDough: "\u5408\u8A08",
    startTime: "\u958B\u59CB",
    endTime: "\u7D42\u4E86",
    // Recipe output — clipboard/share text
    clipboardTitle: "{style} \u2014 Vulcan Pizza Lab",
    clipboardBalls:
      "{n}\u500B\u306E\u751F\u5730\u7389\uFF08\u5404{w}\uFF09",
    clipboardTotal: "\u5408\u8A08: {g}",
    clipboardProcedure: "{style} \u2014 \u4F5C\u308A\u65B9",
    // Recipe output — ingredient names
    flour: "\u5C0F\u9EA6\u7C89",
    flourMix: "\u30D6\u30EC\u30F3\u30C9\u7C89",
    flourEffectiveGluten: "\u5B9F\u52B9\u30B0\u30EB\u30C6\u30F3\u5F37\u5EA6",
    water: "\u6C34",
    salt: "\u5869",
    sugar: "\u7802\u7CD6",
    oilEvo: "\u30AA\u30EA\u30FC\u30D6\u30AA\u30A4\u30EB",
    // Recipe output — compensations
    compTitle: "\u8ABF\u6574",
    compTitleNerd: "\u30AA\u30FC\u30D6\u30F3\u88DC\u6B63",
    compHydration:
      "\u30AA\u30FC\u30D6\u30F3\u306B\u5408\u308F\u305B\u3066\u52A0\u6C34\u7387\u3092\u4E0A\u3052\u307E\u3057\u305F",
    compOil:
      "\u30D4\u30B6\u3092\u67D4\u3089\u304B\u304F\u4FDD\u3064\u305F\u3081\u3001\u5C11\u3057\u591A\u3081\u306E\u30AA\u30A4\u30EB",
    compSugar:
      "\u826F\u3044\u7126\u3052\u8272\u306E\u305F\u3081\u306B\u7802\u7CD6\u3092\u8FFD\u52A0",
    compCookTime:
      "\u5B8C\u74A7\u306A\u7D50\u679C\u306E\u305F\u3081\u306B\u713C\u304D\u6642\u9593\u3092\u5EF6\u9577",
    compThickness:
      "\u5747\u4E00\u306A\u713C\u304D\u4E0A\u304C\u308A\u306E\u305F\u3081\u306B\u8584\u304F\u4F38\u3070\u3059",
    compDefault:
      "\u3042\u306A\u305F\u306E\u8A2D\u5099\u306B\u5408\u308F\u305B\u305F\u8ABF\u6574",
    bakeAdjustmentTitle: "焼き時間・温度",
    relativeToBase: "基本レシピ基準",
    // Recipe output — aria labels
    ariaReduceBalls:
      "\u751F\u5730\u7389\u3092\u6E1B\u3089\u3059",
    ariaAddBalls: "\u751F\u5730\u7389\u3092\u5897\u3084\u3059",
    ariaEarlier: "\u3082\u3063\u3068\u65E9\u304F\u958B\u59CB",
    ariaLater: "\u3082\u3063\u3068\u9045\u304F\u958B\u59CB",
    // Stat strip
    statHydration: "\u52A0\u6C34\u7387",
    statOven: "\u30AA\u30FC\u30D6\u30F3",
    statCookTime: "\u713C\u304D\u6642\u9593",
    statFermentation: "\u767A\u9175",
    statTempSuffix: "{t}\u00B0C\u3067",
    statIdeal: "\u7406\u60F3",
    // Nerd row
    nerdTitle: "\u6280\u8853\u30C7\u30FC\u30BF",
    nerdFlourW: "\u5C0F\u9EA6\u7C89 W",
    nerdPL: "P/L",
    nerdYeast: "\u30A4\u30FC\u30B9\u30C8",
    nerdHoursAt18: "\u6642\u9593 @{refTemp}",
    nerdQ10: "{refTemp}\u6BD4\u306E\u901F\u5EA6",
    nerdAw: "Aw",
    // Time format
    seconds: "\u79D2",
    minutes: "\u5206",
    minute: "\u5206",
    hours: "\u6642\u9593",
    hour: "\u6642\u9593",
    // Score dashboard
    recipeScore: "Match",
    nerdToggle: "PizzaNerd",
    nerdActive: "PizzaNerd\u3092\u6709\u52B9\u5316",
    scienceTitle: "Vulcan Science",
    ariaCloseScores:
      "\u30B9\u30B3\u30A2\u30D1\u30CD\u30EB\u3092\u9589\u3058\u308B",
    ariaViewScores:
      "\u30B9\u30B3\u30A2\u8A73\u7D30\u3092\u898B\u308B",
    tapForDetails:
      "\u30BF\u30C3\u30D7\u3067\u8A73\u7D30\u8868\u793A",
    // Banners
    styleEditorActive: "Style Editor \u6709\u52B9",
    cmsActive: "CMS \u6709\u52B9",
    fieldsModified:
      "\u30D5\u30A3\u30FC\u30EB\u30C9\u5909\u66F4\u6E08\u307F",
    fieldModified:
      "\u30D5\u30A3\u30FC\u30EB\u30C9\u5909\u66F4\u6E08\u307F",
    editOven: "\u30AA\u30FC\u30D6\u30F3\u3092\u7DE8\u96C6",
    weatherCity: "\u3042\u306A\u305F\u306E\u8857",
    weatherOutdoor: "\u5916\u6C17{t}\u00B0C",
    weatherKitchen: "\u30AD\u30C3\u30C1\u30F3\u6E29\u5EA6",
    badgeIdeal: "\u6700\u901F",
    badgeRecent: "\u6700\u8FD1",
    autoLabel: "\u81EA\u52D5",
    cancel: "\u30AD\u30E3\u30F3\u30BB\u30EB",
    changeOven: "\u5909\u66F4",
    ovenFallback: "\u30AA\u30FC\u30D6\u30F3",
    pantryFlours: "\u5C0F\u9EA6\u7C89",
    pantryYeasts: "\u30A4\u30FC\u30B9\u30C8",
    equipByHand: "\u624B\u3054\u306D",
    equipMixer:
      "\u30B9\u30BF\u30F3\u30C9\u30DF\u30AD\u30B5\u30FC",
    equipStone: "\u30D4\u30B6\u30B9\u30C8\u30FC\u30F3",
    equipSteel:
      "\u30D9\u30FC\u30AD\u30F3\u30B0\u30B9\u30C1\u30FC\u30EB",
    equipPan: "\u5929\u677F",
    equipKneading: "\u3053\u306D",
    equipSurface: "\u7126\u304D\u9762",
    kitchenTitle:
      "\u3042\u306A\u305F\u306E\u30AD\u30C3\u30C1\u30F3",
    pantryOptional: "\u4EFB\u610F",
    specialFlours: "\u7279\u6B8A\u5C0F\u9EA6\u7C89",
    brandSuggest:
      "\u30D6\u30E9\u30F3\u30C9\u3092\u77E5\u3063\u3066\u3044\u307E\u3059\u304B\uFF1F",
    badgeSelected: "\u9078\u629E\u6E08\u307F",
    otherCompatibleFlours:
      "\u305D\u306E\u4ED6\u306E\u4E92\u63DB\u5C0F\u9EA6\u7C89",
    flourSelectHint:
      "\u5C0F\u9EA6\u7C89\u3092\u9078\u629E\u3059\u308B\u3068\u3001\u30EC\u30B7\u30D4\u306EW\u3068P/L\u304C\u81EA\u52D5\u66F4\u65B0\u3055\u308C\u307E\u3059\u3002",
    flourSelected: "\u9069\u7528\u6E08\u307F",
    autolysisSuggested:
      "\u30AA\u30FC\u30C8\u30EA\u30FC\u30BA\u63A8\u5968",
    dietGlutenFree:
      "\u30B0\u30EB\u30C6\u30F3\u30D5\u30EA\u30FC",
    dietLactoseFree:
      "\u4E73\u7CD6\u4E0D\u8010\u75C7\u5BFE\u5FDC",
    dietVegan: "\u30F4\u30A3\u30FC\u30AC\u30F3",
    dietLowFodmap: "\u4F4EFODMAP",
    dietHistamine: "\u4F4E\u30D2\u30B9\u30BF\u30DF\u30F3",
    dietNickel: "\u4F4E\u30CB\u30C3\u30B1\u30EB",
  },
  tips: {
    kitchenTemp:
      "ã­ããã³ã®æ¸©åº¦ã¯çºéµã®éãã«å½±é¿ãã¾ããã¨ã³ã¸ã³ãæéã¨åéãèªåçã«èª¿æ´ãã¾ãã",
    timeSlot:
      "\u30AD\u30C3\u30C1\u30F3\u306E\u6E29\u5EA6\u306F\u767A\u9175\u6642\u9593\u306B\u5F71\u97FF\u3057\u307E\u3059\u3002\u6642\u9593\u304C\u3042\u308B\u307B\u3069\u3001\u8EFD\u304F\u3066\u6D88\u5316\u306E\u826F\u3044\u751F\u5730\u306E\u9078\u629E\u80A2\u304C\u5897\u3048\u307E\u3059\u3002",
    skill:
      "\u3042\u306A\u305F\u306E\u7D4C\u9A13\u30EC\u30D9\u30EB\u306B\u5408\u308F\u305B\u3066\u30EC\u30B7\u30D4\u306E\u8907\u96D1\u3055\u3092\u8ABF\u6574\u3057\u307E\u3059\u3002",
    equipment:
      "\u30B9\u30C8\u30FC\u30F3\u3084\u30B9\u30C1\u30FC\u30EB\u3067\u30AF\u30E9\u30B9\u30C8\u304C\u5909\u308F\u308A\u307E\u3059\u3002\u5929\u677F\u306F\u30C6\u30EA\u30A2\u30FB\u30ED\u30DE\u30FC\u30CA\u3084\u30C7\u30C8\u30ED\u30A4\u30C8\u306B\u5FC5\u9808\u3067\u3059\u3002",
    oven: "\u30AA\u30FC\u30D6\u30F3\u306E\u6700\u9AD8\u6E29\u5EA6\u304C\u3001\u81EA\u5B85\u3067\u518D\u73FE\u3067\u304D\u308B\u30B9\u30BF\u30A4\u30EB\u3092\u6C7A\u3081\u307E\u3059\u3002",
    pantry:
      "\u5B9F\u969B\u306E\u30D1\u30F3\u30C8\u30EA\u30FC\u306B\u5408\u308F\u305B\u3066\u30EC\u30B7\u30D4\u3092\u8ABF\u6574\u3057\u307E\u3059\uFF1A\u5C0F\u9EA6\u7C89\u3068\u30A4\u30FC\u30B9\u30C8\u306E\u7A2E\u985E\u3002",
  },
  hero: {
    title_line1: "\u3042\u306A\u305F\u306E",
    title_line2: "\u7406\u60F3\u306E\u30D4\u30B6\u3002",
    subtitle:
      "\u6750\u6599\u3092\u6559\u3048\u3066\u304F\u3060\u3055\u3044\u3002\u6700\u9069\u306A\u30B9\u30BF\u30A4\u30EB\u3078\u3054\u6848\u5185\u3057\u307E\u3059\u3002",
  },
  steps: {
    context: {
      number: "01 \u2014 \u30B3\u30F3\u30C6\u30AD\u30B9\u30C8",
      title: "\u3044\u3064\u30FB\u3069\u3053\u3067",
      subtitle:
        "\u6642\u9593\u3001\u6E29\u5EA6\u3001\u74B0\u5883",
    },
    setup: {
      number: "02 \u2014 \u30BB\u30C3\u30C8\u30A2\u30C3\u30D7",
      title: "\u3042\u306A\u305F\u306E\u30AD\u30C3\u30C1\u30F3",
      subtitle:
        "\u9053\u5177\u3001\u7D4C\u9A13\u3001\u30D1\u30F3\u30C8\u30EA\u30FC",
    },
    styles: {
      number: "03 \u2014 \u30B9\u30BF\u30A4\u30EB",
      title: "\u30B9\u30BF\u30A4\u30EB\u3092\u9078\u3076",
      subtitle:
        "\u3042\u306A\u305F\u306B\u5408\u308F\u305B\u305F\u63D0\u6848",
    },
  },
  sections: {
    when: {
      title:
        "\u3044\u3064\u30D4\u30B6\u3092\u98DF\u3079\u305F\u3044\uFF1F",
      description:
        "\u767A\u9175\u6642\u9593\u3092\u8A08\u7B97\u3059\u308B\u305F\u3081\u306B\u30BF\u30A4\u30DF\u30F3\u30B0\u3092\u9078\u629E",
    },
    skill: {
      title: "\u7D4C\u9A13\u30EC\u30D9\u30EB",
      description:
        "\u30EC\u30B7\u30D4\u306E\u8907\u96D1\u3055\u3092\u8ABF\u6574\u3057\u307E\u3059",
    },
    oven: {
      title: "\u30AA\u30FC\u30D6\u30F3",
      description: "\u7A2E\u985E\u3068\u6700\u9AD8\u6E29\u5EA6",
    },
    pantry: {
      title: "\u30D1\u30F3\u30C8\u30EA\u30FC",
      description:
        "\u304A\u5BB6\u306B\u3042\u308B\u5C0F\u9EA6\u7C89\u3068\u30A4\u30FC\u30B9\u30C8",
    },
    dietary: {
      title: "\u98DF\u4E8B\u5236\u9650",
      description:
        "\u30AA\u30D7\u30B7\u30E7\u30F3\u306E\u30D5\u30A3\u30EB\u30BF\u30FC",
    },
    equipment: {
      title: "\u8A2D\u5099",
      description:
        "\u30AD\u30C3\u30C1\u30F3\u306B\u3042\u308B\u3082\u306E",
    },
  },
  timeSlots: {
    tonight: {
      label: "\u4ECA\u591C",
      sublabel: "4\u20136\u6642\u9593",
      emoji: "\u{1F319}",
      hours: 5,
    },
    tomorrow_lunch: {
      label: "\u660E\u65E5\u306E\u6607\u98DF",
      sublabel: "16\u201320\u6642\u9593",
      emoji: "\u2600\uFE0F",
      hours: 18,
    },
    tomorrow_dinner: {
      label: "\u660E\u65E5\u306E\u5915\u98DF",
      sublabel: "24\u201328\u6642\u9593",
      emoji: "\u{1F306}",
      hours: 26,
    },
    day_after: {
      label: "\u660E\u5F8C\u65E5",
      sublabel: "40\u201348\u6642\u9593",
      emoji: "\u{1F4C5}",
      hours: 44,
    },
    weekend: {
      label: "\u9031\u672B",
      sublabel: "72\u6642\u9593\u4EE5\u4E0A",
      emoji: "\u{1F389}",
      hours: 72,
    },
  },
  ovenPresets: {
    home: {
      name: "\u5BB6\u5EAD\u7528\u30AA\u30FC\u30D6\u30F3",
      maxTemp: 250,
      icon: "home",
    },
    electric_standard: {
      name: "\u96FB\u6C17\u30AA\u30FC\u30D6\u30F3\uFF08\u6A19\u6E96\uFF09",
      maxTemp: 300,
      icon: "zap",
    },
    gas: {
      name: "\u30AC\u30B9\u30AA\u30FC\u30D6\u30F3\uFF08\u696D\u52D9\u7528\uFF09",
      maxTemp: 350,
      icon: "flame",
    },
    electric_high: {
      name: "\u9AD8\u6E29\u96FB\u6C17\u30AA\u30FC\u30D6\u30F3",
      maxTemp: 450,
      icon: "thermometer",
    },
    wood: {
      name: "\u85AA\u7AAF",
      maxTemp: 500,
      icon: "flame-kindling",
    },
  },
  skillLevels: {
    "1": {
      name: "\u521D\u5FC3\u8005",
      description:
        "\u30D4\u30B6\u4F5C\u308A\u304C\u521D\u3081\u3066",
    },
    "2": {
      name: "\u4E2D\u7D1A\u8005",
      description:
        "\u4F55\u5EA6\u304B\u30D4\u30B6\u3092\u4F5C\u3063\u305F\u3053\u3068\u304C\u3042\u308B",
    },
    "3": {
      name: "\u4E0A\u7D1A\u8005",
      description:
        "\u6280\u8853\u3068\u30D1\u30E9\u30E1\u30FC\u30BF\u3092\u7406\u89E3\u3057\u3066\u3044\u308B",
    },
    "4": {
      name: "\u30A8\u30AD\u30B9\u30D1\u30FC\u30C8",
      description:
        "\u6280\u8853\u3092\u5B8C\u5168\u306B\u30DE\u30B9\u30BF\u30FC",
    },
  },
  families: {
    napoletana: {
      name: "\u30CA\u30DD\u30EA\u30BF\u30F3",
      description:
        "\u8EFD\u3055\u3001\u5929\u7136\u767A\u9175\u3001\u6975\u9AD8\u6E29\u3067\u306E\u8D85\u9AD8\u901F\u713C\u6210",
      emoji: "\u{1F1EE}\u{1F1F9}",
    },
    romana: {
      name: "\u30ED\u30FC\u30DE\u30F3",
      description:
        "\u30B9\u30AF\u30ED\u30C3\u30AD\u30A2\u30EC\u30C3\u30E9\u306E\u6975\u4E0A\u306E\u30AF\u30EA\u30B9\u30D4\u30FC\u304B\u3089\u30C6\u30EA\u30A2\u306E\u9AD8\u52A0\u6C34\u307E\u3067",
      emoji: "\u{1F3DB}\uFE0F",
    },
    americana: {
      name: "\u30A2\u30E1\u30EA\u30AB\u30F3",
      description:
        "\u30A4\u30BF\u30EA\u30A2\u7CFB\u30A2\u30E1\u30EA\u30AB\u306E\u9069\u5FDC\uFF1A\u5B9F\u7528\u6027\u3001\u30B9\u30C8\u30EA\u30FC\u30C8\u30D5\u30FC\u30C9\u3001\u5730\u57DF\u306E\u30D0\u30E9\u30A8\u30C6\u30A3",
      emoji: "\u{1F5FD}",
    },
    contemporanea: {
      name: "\u30B3\u30F3\u30C6\u30F3\u30DD\u30E9\u30EA\u30FC",
      description:
        "\u6D88\u5316\u306E\u826F\u3055\u3001\u5B9F\u9A13\u6027\u3001\u9AD8\u52A0\u6C34\u3001\u9AD8\u5EA6\u306A\u6280\u8853",
      emoji: "\u{1F52C}",
    },
  },
  allFamiliesLabel:
    "\u3059\u3079\u3066\u306E\u30D5\u30A1\u30DF\u30EA\u30FC",
  tiers: {
    perfect: {
      label: "\u6700\u9069",
      subtitle: "\u6700\u9AD8\u306E\u76F8\u6027",
    },
    good: {
      label: "\u826F\u597D",
      subtitle: "\u7D20\u6674\u3089\u3057\u3044\u9078\u629E",
    },
    challenging: {
      label: "\u30C1\u30E3\u30EC\u30F3\u30B8\u30F3\u30B0",
      subtitle: "\u52C7\u6C17\u3042\u308B\u4EBA\u3078",
    },
  },
  scoreDimensions: {
    authenticity: {
      label: "\u6B63\u7D71\u6027",
      short: "\u6B63\u7D71",
      weight: 0.3,
    },
    feasibility: {
      label: "\u5B9F\u73FE\u53EF\u80FD\u6027",
      short: "\u5B9F\u73FE",
      weight: 0.25,
    },
    digestibility: {
      label: "\u6D88\u5316\u6027",
      short: "\u6D88\u5316",
      weight: 0.2,
    },
    sustainability: {
      label: "\u6301\u7D9A\u53EF\u80FD\u6027",
      short: "\u6301\u7D9A",
      weight: 0.15,
    },
    experimentation: {
      label: "\u5B9F\u9A13\u6027",
      short: "\u5B9F\u9A13",
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
    stylePhotos: STYLE_PHOTOS,
    fallbackPhoto:
      "https://images.unsplash.com/photo-1717883235373-ef10b2a745a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
  },
  result: {
    breadcrumb:
      "\u3042\u306A\u305F\u306E\u7406\u60F3\u306E\u30D4\u30B6",
    heading:
      "\u30EC\u30B7\u30D4\u304C\u3067\u304D\u307E\u3057\u305F",
    backLabel: "\u9078\u629E\u306B\u623B\u308B",
  },
  misc: {
    showAllStyles: "すべて表示",
    noFloursInCategory: "このカテゴリーに小麦粉はありません",
    noTroubleshootingResults: "この検索に該当する問題は見つかりません",
    moreInfo: "詳細",
    changeTiming: "タイミングを変更",
    kitchenTempSubtitle: "温度は発酵の速さに影響します",
    techAdjustmentsApplied: "技術的な調整を適用しました",
    techDataAria: "技術データを表示 (W, P/L, Q10, Aw)",
    techDataTitle: "上級者向けの技術データを表示 (小麦粉W, P/L, Q₁₀, Aw...)",
    feedbackYes: "はい、ぜひ",
    feedbackNo: "いいえ、大丈夫です",
    feedbackPlaceholder: "何を変えましたか？仕上がりは？役立つ詳細...",
    preFermentCompare: "クイック比較",
    scoreExplainer: "レシピの評価ではなく、設定したバージョンがこのスタイルの「完璧」にどれだけ近いかを示します。",
    companionContext: "キッチンの温度と使える時間が全工程を左右します。",
    companionSetup: "あなたの経験・オーブン・実際の在庫に合わせてレシピを調整します。",
    companionStyles: "各スタイルには固有のパラメータがあります。自分の条件に最も合うものを選びましょう。",
    smartLinkOn: "パラメータ連動 — スライダーを動かすと他も自動調整されます",
    smartLinkOff: "すべてのパラメータを連動させて自動調整",
    smartLinkApplied: "{param}：他のパラメータとタイムラインを再調整しました。",
    settingsHelp: "これらの情報をもとにVulcanが時間とレシピを調整します。",
    versionsLabel: "バージョン",
    versionsHint: "このスタイルの解釈で、それぞれ独自のパラメータ範囲を持ちます。アクティブなバージョンがスライダーの「範囲内」を決めます。",
    learnHeroTitle1: "おうちの",
    learnHeroTitle2: "ピッツァ職人になろう。",
    learnHeroSubtitle: "小さなことを正しく理解すれば、すべての生地が変わります。ここから始めましょう。",
    learnResources: "リソース",
    kitchenTempLabel: "キッチンの温度",
    kitchenTempDown: "キッチンの温度を下げる",
    kitchenTempUp: "キッチンの温度を上げる",
    current: "選択中",
    noStyleInFamily: "あなたの条件に合うこのファミリーのスタイルはありません。",
    notFeasibleExplainer: "これらのスタイルには今は無い条件が必要です（薪窯、長い経験、プロ用機材など）。透明性のために掲載しています — 何が必要かはタップして確認できます。",
    exploreHeroTitle1: "スタイルを探す",
    exploreHeroTitle2: "とレシピ。",
    exploreSectionTraditional: "伝統的なスタイル",
    badgeBeginnerFriendly: "初心者向け",
    interpretationsLabel: "解釈",
    goToSite: "サイトへ",
    signatureLabel: "シグネチャー",
    noSignature: "シグネチャーなし",
    fineParams: "詳細パラメータ",
    cmsRestoreContent: "CMSコンテンツを復元",
  },
  feedback: {
    savedTitle: "フィードバックを保存しました — ありがとう！",
    savedBody: "あなたのデータはエンジンの調整に役立ちます。DevTools → Engine Lab で確認できます。",
    nextTimeTitle: "次回は",
    triedQuestion: "このレシピを試しましたか？",
    triedSubtitle: "あなたのフィードバックは Vulcan のエンジンの調整に役立ちます。",
    success: "成功",
    fail: "失敗",
    detailedPrompt: "ありがとう！詳しいフィードバックを残しませんか？",
    detailedSubtitle: "このスタイルの再現性と消化性のスコアの調整に役立ちます。",
    detailedTitle: "詳細なフィードバック",
    recipeSuccess: "レシピ成功",
    recipeFail: "レシピ失敗",
    ratingOverall: "総合評価",
    ratingTaste: "味",
    ratingTexture: "食感・気泡",
    ratingDifficulty: "難易度",
    ratingDifficultyHint: "1=簡単, 5=不可能",
    ratingAuth: "どれくらい本格的か",
    ratingAuthHint: "A-Scoreを調整",
    ratingDig: "どれくらい消化に良かったか",
    ratingDigHint: "D-Scoreを調整",
    issuesLabel: "発生した問題",
    notesLabel: "メモ",
    submit: "フィードバックを送信",
  },
  yeastLabels: {
    fresh: "\u751F\u30A4\u30FC\u30B9\u30C8",
    dry: "\u30C9\u30E9\u30A4\u30A4\u30FC\u30B9\u30C8",
    sourdough: "\u5929\u7136\u9175\u6BCD",
  },
  yeastDetails: {
    fresh:
      "\u5B9A\u756A\u306E\u30AD\u30E5\u30FC\u30D6\u30BF\u30A4\u30D7",
    dry: "\u4FBF\u5229\u3067\u9577\u671F\u4FDD\u5B58\u53EF\u80FD",
    sourdough:
      "\u8907\u96D1\u306A\u98A8\u5473\u3001\u9577\u6642\u9593\u719F\u6210",
  },
  flourLabels: {
    "00": "\u30BF\u30A4\u30D700\u5C0F\u9EA6\u7C89",
    "0": "\u30BF\u30A4\u30D70\u5C0F\u9EA6\u7C89",
    manitoba:
      "\u30DE\u30CB\u30C8\u30D0\uFF08\u5F37\u529B\u7C89\uFF09",
    integrale: "\u5168\u7C92\u7C89",
    semola: "\u30BB\u30E2\u30EA\u30CA",
  },
  flourDetails: {
    "00": "\u5B9A\u756A\u3001\u4E07\u80FD",
    "0": "\u4E2D\u7A0B\u5EA6\u306E\u5F37\u5EA6",
    manitoba:
      "\u9AD8\u5F37\u5EA6\u3001\u9577\u6642\u9593\u719F\u6210",
    integrale:
      "\u98DF\u7269\u7E4A\u7DAD\u3068\u98A8\u5473\u304C\u8C4A\u304B",
    semola: "\u30B5\u30AF\u30B5\u30AF\u611F\u3001\u91D1\u8272",
  },
  filters: {
    advancedLabel: "\u8A73\u7D30\u30D5\u30A3\u30EB\u30BF\u30FC",
    removeFilters:
      "\u30D5\u30A3\u30EB\u30BF\u30FC\u3092\u89E3\u9664",
    brandedFlours: "\u30D6\u30E9\u30F3\u30C9\u5C0F\u9EA6\u7C89",
    settingsOpen: "\u8A2D\u5B9A",
    settingsClosed: "\u3042\u306A\u305F\u306E\u8A2D\u5B9A",
    hydrationLabel: "\uD83D\uDCA7 \u52A0\u6C34\u7387",
    hydrationLow: "\u4F4E <60%",
    hydrationMedium: "\u4E2D 60-70%",
    hydrationHigh: "\u9AD8 70-85%",
    hydrationExtreme: "\u6975\u9AD8 >85%",
    textureLabel:
      "\uD83C\uDFAF \u30C6\u30AF\u30B9\u30C1\u30E3\u30FC",
    textureCrispyThin: "\u8584\u304F\u30D1\u30EA\u30D1\u30EA",
    textureThickAiry: "\u539A\u304F\u3075\u3093\u308F\u308A",
    textureAiryCrumb: "\u6C17\u6CE1\u5927\u304D\u3081",
    textureDeepDish:
      "\u30C7\u30A3\u30FC\u30D7\u30C7\u30A3\u30C3\u30B7\u30E5",
    skillLabel:
      "\uD83D\uDC68\u200D\uD83C\uDF73 \u30EC\u30D9\u30EB",
    skillBeginner: "\u521D\u5FC3\u8005",
    skillIntermediate: "\u4E2D\u7D1A",
    skillAdvanced: "\u4E0A\u7D1A",
    skillExpert: "\u30A8\u30AD\u30B9\u30D1\u30FC\u30C8",
    timeFast: "\u77ED\u6642\u9593",
    ovenLabel: "\uD83D\uDD25 \u713C\u304D\u65B9",
    ovenHome: "\u5BB6\u5EAD\u7528\u30AA\u30FC\u30D6\u30F3",
    ovenWood: "\u85AA\u7AAF",
    ovenElectricHigh: "\u96FB\u6C17 >350\u00B0C",
    ovenPan: "\u30D5\u30E9\u30A4\u30D1\u30F3",
  },
  glossary: {
    pageTitle: "\u6280\u8853\u7528\u8A9E\u96C6",
    searchPlaceholder:
      "\u7528\u8A9E\u3001\u8A18\u53F7\u3001\u5B9A\u7FA9\u3092\u691C\u7D22...",
    cancelSearch: "\u30AF\u30EA\u30A2",
    noResults:
      "\u300C{query}\u300D\u306B\u4E00\u81F4\u3059\u308B\u7528\u8A9E\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093",
    allCategories: "\u3059\u3079\u3066",
    formulaLabel: "\u5F0F",
    rangesLabel: "\u4EE3\u8868\u7684\u306A\u7BC4\u56F2",
    whyImportantLabel: "\u306A\u305C\u91CD\u8981\u304B",
    relatedLabel: "\u95A2\u9023",
    backToHome: "\u30DB\u30FC\u30E0\u306B\u623B\u308B",
    termCount: "{count}\u7528\u8A9E",
    catRheology: "\u30EC\u30AA\u30ED\u30B8\u30FC",
    catRheologyDesc:
      "\u5C0F\u9EA6\u7C89\u3068\u751F\u5730\u306E\u6A5F\u68B0\u7684\u7279\u6027",
    catFermentation: "\u767A\u9175",
    catFermentationDesc:
      "\u767A\u9175\u3001\u719F\u6210\u3001\u751F\u7269\u5B66\u7684\u30D7\u30ED\u30BB\u30B9",
    catThermal: "\u71B1",
    catThermalDesc: "\u4F1D\u71B1\u3068\u713C\u304D",
    catChemistry: "\u5316\u5B66",
    catChemistryDesc:
      "\u7D44\u6210\u3068\u5316\u5B66\u53CD\u5FDC",
    catMechanics: "\u6A5F\u68B0",
    catMechanicsDesc:
      "\u52A0\u5DE5\u3001\u8A2D\u5099\u3001\u8A08\u6E2C",
    catScoring: "\u30B9\u30B3\u30A2",
    catScoringDesc: "Vulcan\u54C1\u8CEA\u6307\u6A19",
  },
  engineMessages: {
    "auth.hydrationOff":
      "加水率が中心から外れています (-{penalty}%)",
    "auth.wOutOfRange": "小麦粉Wが範囲外 (-{penalty}%)",
    "auth.plOutOfRange":
      "P/L {pl}が範囲{plMin}-{plMax}外 (-{penalty}%)",
    "auth.notWoodOven": "薪窯ではありません (-15%)",
    "auth.tempVsIdeal":
      "\u6E29\u5EA6{temp} vs {ideal} (-{penalty}%)",
    "auth.tempBelowMin": "温度が最低値以下 (-{penalty}%)",
    "auth.fermentTooShort":
      "発酵時間が短すぎます (-{penalty}%)",
    "auth.fermentTooLong": "発酵時間が長すぎます (-{penalty}%)",
    "feas.ovenSuboptimal":
      "\u30AA\u30FC\u30D6\u30F3\u304C\u6E96\u6700\u9069: {temp} vs \u7406\u60F3{ideal}",
    "feas.ovenTooCold":
      "\u30AA\u30FC\u30D6\u30F3\u6E29\u5EA6\u4E0D\u8DB3: {temp} < \u6700\u4F4E{min}",
    "feas.wTooLow": "Wが低すぎます: {w} < {wMin}",
    "feas.wTooHigh": "Wが非常に高い ({w})。硬い生地。",
    "feas.hydrationBeginnerHigh": "加水率>75%は初心者に不向き",
    "feas.hydrationNeedsPractice": "高加水は練習が必要です",
    "feas.hydrationMedBeginner": "初心者には中〜高加水",
    "feas.flourTooWeakForHydration":
      "この加水率には小麦粉が弱すぎます",
    "feas.prefermentNeedsExperience":
      "種生地には経験が必要です",
    "dig.fermentTooShort": "発酵が短すぎ: でんぷん未分解",
    "dig.fermentShort": "短い発酵: 消化性が限定的",
    "dig.fodmapReduced": "FODMAP削減 ~{pct}%",
    "dig.fodmapHighReduction": "FODMAP削減 >80%",
    "dig.extremeMaturation": "極限熟成: 最大の風味の複雑さ",
    "dig.highYeastDosage":
      "酵母投入量が多い ({pct}%): -{penalty}% 消化性",
    "dig.coldFermentation": "低温発酵: 最適な酵素活性",
    "sust.quickCook": "短時間焼成: 低エネルギー消費",
    "sust.longCook": "長時間焼成: 高エネルギー消費",
    "sust.ambientFerment": "室温発酵: 冷蔵庫エネルギー不要",
    "sust.pureDough": "ピュアな生地: 小麦粉、水、塩、酵母のみ",
    "sust.sourdoughZeroImpact":
      "天然酵母: 自家製、ゼロインパクト",
    "rec.timeCompatible":
      "発酵{fMin}-{fMax}h: あなたの時間に適合",
    "rec.timeAdaptable": "発酵は~{hours}hに調整可能",
    "rec.timeInsufficient":
      "最低{fMin}h必要、{available}hしかありません",
    "rec.needsWoodOven": "薪窯が必要です",
    "rec.ovenIdeal":
      "\u3042\u306A\u305F\u306E\u30AA\u30FC\u30D6\u30F3\u306F\u7406\u60F3\u6E29\u5EA6\u306B\u5230\u9054 ({ideal})",
    "rec.ovenAdequate": "オーブンは適切 (自動時間/温度補正)",
    "rec.ovenTooCold":
      "\u30AA\u30FC\u30D6\u30F3\u6E29\u5EA6\u4E0D\u8DB3: {temp} < \u6700\u4F4E{min}",
    "rec.skillMatch": "あなたのレベルに適しています",
    "rec.skillExpert": "あなたのレベルならどのスタイルも可能",
    "rec.hydrationNeedsPractice": "高加水は練習が必要です",
    "rec.advancedForBeginner": "初心者には上級スタイル",
    "rec.noKneadNoMixer": "ミキサー不要 (no-knead)",
    "rec.handsHighHydration": "高加水: 手ごねは非常に困難",
    "rec.handsMedHydration": "中〜高加水: 手ごねは練習が必要",
    "rec.forkIdealHighH": "フォークミキサーは高加水に最適",
    "rec.forkLowFriction": "フォークミキサー: 低い摩擦熱",
    "rec.spiralOptimal": "プロ用スパイラル: 最適なミキシング",
    "rec.domesticStrugglesHighH":
      "家庭用ミキサー: 加水率>80%では困難な場合あり",
    "rec.mixerHelps": "ミキサーがプロセスを容易にします",
    "rec.mixerRecommended": "高加水: ミキサー推奨",
    "rec.castIronPerfect": "鋳鉄はこのスタイルに最適",
    "rec.panFits": "天板はこのスタイルに適合",
    "rec.needsPan": "このスタイルには天板が必要",
    "rec.refractoryIdeal": "耐火石: ナポリピッツァに最適",
    "rec.steelPlateCrispy":
      "スチールプレート: 秒でカリカリの底",
    "rec.panPerfect": "あなたの天板はこのスタイルに最適",
    "rec.flourMatch": "ストックの小麦粉が適合",
    "rec.flourPartial":
      "小麦粉は部分的に適合 (Wが理想的でない)",
    "rec.flourNoMatch":
      "必要なW範囲のストック小麦粉がありません",
    "rec.sourdoughLongFerment": "天然酵母は長期熟成に最適",
    "rec.sourdoughOnlyShort": "天然酵母のみ: 短時間発酵は困難",
    "tip.waterTempCold":
      "55の法則: 冷蔵庫の水を使用してください ({temp})。ミキサーが生地を温めます。",
    "tip.waterTempNormal":
      "55の法則: {temp}の水を使って{ddt}の生地温度を目指してください。",
    "tip.frictionNote": "ミキサー摩擦補正: {friction}",
    "hint.flourWeak": "\u5F31\u529B\u306A\u5C0F\u9EA6\u7C89\uFF08\u30AF\u30E9\u30B7\u30C3\u30AF\u306A00\uFF09",
    "hint.flourMedium": "\u4E2D\u7A0B\u5EA6\u306E\u5F37\u3055\u306E\u5C0F\u9EA6\u7C89",
    "hint.flourStrong": "\u5F37\u529B\u306A\u30D4\u30B6\u7528\u5C0F\u9EA6\u7C89",
    "hint.flourVeryStrong": "\u3068\u3066\u3082\u5F37\u529B\u306A\u5C0F\u9EA6\u7C89\uFF08\u30DE\u30CB\u30C8\u30D0\uFF09",
    "hint.yeastDryPinch": "\u2248 \u3054\u304F\u5C11\u91CF",
    "hint.yeastDryQuarterTsp": "\u2248 \u5C0F\u3055\u3058\u00BC",
    "hint.yeastDryHalfTsp": "\u2248 \u5C0F\u3055\u3058\u00BD",
    "hint.yeastDryOneTsp": "\u2248 \u5C0F\u3055\u30581\uFF08\u3059\u308A\u304D\u308A\uFF09",
    "hint.yeastFreshSmall": "\u2248 \u3072\u3088\u3053\u8C46\u534A\u5206",
    "hint.yeastFreshMedium": "\u2248 \u3072\u3088\u3053\u8C461\u7C92",
    "hint.yeastFreshLarge": "\u2248 \u30D8\u30FC\u30BC\u30EB\u30CA\u30C3\u30C41\u7C92",
    "serving.peopleOne": "\u2248 {n}\u4EBA\u5206",
    "serving.peopleMany": "\u2248 {n}\u4EBA\u5206",
    "serving.peopleRange": "\u2248 {min}\u301C{max}\u4EBA\u5206",
    "topping.auth.canonical": "\u898F\u5B9A\u306B\u6E96\u62E0",
    "topping.auth.natural": "\u4F1D\u7D71\u7684",
    "topping.auth.common": "\u4EE3\u66FF",
    "topping.auth.experimental": "\u8A66\u3059\u4FA1\u5024\u3042\u308A",
    "topping.auth.taboo": "\u975E\u63A8\u5968",
    "recipeSetup.dough": "\u751F\u5730",
    "recipeSetup.styleBase": "\u57FA\u672C\u30B9\u30BF\u30A4\u30EB",
    "recipeSetup.temp.fridge": "\u51B7\u8535",
    "recipeSetup.temp.cool": "\u6DBC\u3057\u3044\u5834\u6240",
    "recipeSetup.temp.room": "\u5BA4\u6E29",
    "recipeSetup.versionApplied": "{label}: \u751F\u5730\u30D1\u30E9\u30E1\u30FC\u30BF\u3092\u9069\u7528\u3057\u307E\u3057\u305F",
    "version.label.Leggerissima": "\u3068\u3066\u3082\u8EFD\u3044",
    "version.label.Casalingo": "\u5BB6\u5EAD\u5411\u3051",
    "version.label.Casalinga": "\u5BB6\u5EAD\u5411\u3051",
    "version.label.Classica": "\u30AF\u30E9\u30B7\u30C3\u30AF",
    "version.label.Tradizionale": "\u4F1D\u7D71\u7684",
    "version.label.Disciplinare AVPN": "AVPN\u898F\u5B9A",
    "version.label.Moderna": "\u30E2\u30C0\u30F3",
    "version.label.Pro": "\u30D7\u30ED",
    "version.label.Bilanciata": "\u30D0\u30E9\u30F3\u30B9\u578B",
    "timelineComfort.title": "\u898B\u3084\u3059\u3044\u30BF\u30A4\u30E0\u30E9\u30A4\u30F3",
    "timelineComfort.active": "\u6709\u52B9\uFF1A\u591C\u9593\u306E\u4F5C\u696D\u3092\u907F\u3051\u307E\u3059\u3002",
    "timelineComfort.nightDetected": "\u591C\u9593\u306B\u4F5C\u696D\u304C\u3042\u308A\u307E\u3059\u3002",
    "timelineComfort.idle": "\u5FC5\u8981\u306A\u3089\u6642\u9593\u3092\u8ABF\u6574\u3057\u307E\u3059\u3002",
    "timeline.preheat.title": "\u30AA\u30FC\u30D6\u30F3\u3092\u6700\u5927\u306B\u4E88\u71B1",
    "timeline.preheat.desc": "\u4ECA\u30AA\u30FC\u30D6\u30F3\u3092{temp}\u306B\u4E88\u71B1\u3057\u3066\u304F\u3060\u3055\u3044{equipmentNote}\u3002\u305D\u306E\u9593\u306B\u751F\u5730\u7389\u306E\u6700\u7D42\u767A\u9175\u304C\u7D42\u308F\u308A\u307E\u3059\u3002",
    "timeline.preheat.equipmentNote": "\uFF08\u77F3\u307E\u305F\u306F\u30B9\u30C1\u30FC\u30EB\u3082\u5165\u308C\u3066\u304A\u304F\uFF09",
    "timeline.preheat.tipBeginner": "\u30AA\u30FC\u30D6\u30F3\u306F\u3057\u3063\u304B\u308A\u71B1\u304F\u3002\u713C\u304F30\u5206\u4EE5\u4E0A\u524D\u304B\u3089\u4E88\u71B1\u3057\u307E\u3057\u3087\u3046\u3002",
    "timeline.preheat.tipNerd": "\u6700\u521D\u306E1\u5206\u306F\u8868\u9762\u306E\u84C4\u71B1\u304C\u652F\u914D\u7684\u3067\u3059\u3002{minutes}\u5206\u4E88\u71B1\u3059\u308B\u3068\u3001\u5EAB\u5185\u306E\u7A7A\u6C17\u3060\u3051\u3067\u306A\u304F\u77F3/\u30B9\u30C1\u30FC\u30EB\u307E\u3067\u71B1\u304C\u5165\u308A\u307E\u3059\u3002",
    "tip.waterTemp": "",
    "recipeSetup.noSignature": "シグネチャーなし",
    "recipeSetup.currentParams": "現在のパラメータ",
    "recipeSetup.noSignatureAlreadyActive": "すでに適用されているシグネチャーはありません",
    "recipeSetup.signatureApplied": "{label}：シグネチャーを適用しました",
    "recipeSetup.signatureRemoved": "シグネチャーを解除：パラメータをリセットしました",
  },
  scienceLabels: {
    yeastBaker: "\u30D1\u30F3\u7528\u30A4\u30FC\u30B9\u30C8",
    effectiveHours: "\u6709\u52B9\u6642\u9593",
    q10Factor: "Q\u2081\u2080\u4FC2\u6570",
    q10Cold: "\u4F4E\u6E29",
    q10Sourdough: "\u5929\u7136\u9175\u6BCD",
    q10Standard: "\u6A19\u6E96",
    waterActivity: "\u6C34\u5206\u6D3B\u6027",
    glutenNetwork:
      "\u30B0\u30EB\u30C6\u30F3\u30CD\u30C3\u30C8\u30EF\u30FC\u30AF",
    proteolysis: "\u30BF\u30F3\u30D1\u30AF\u5206\u89E3",
    starchDegradation: "\u30C7\u30F3\u30D7\u30F3\u5206\u89E3",
    fodmapReduction: "FODMAP\u524A\u6E1B",
    plEstimated: "P/L\u63A8\u5B9A\u5024",
    bakingEnergy: "\u713C\u6210\u30A8\u30CD\u30EB\u30AE\u30FC",
    waterTemp: "\u6C34\u6E29",
    desiredDoughTemp: "\u751F\u5730\u6E29\u5EA6",
    frictionFactor: "\u6469\u64E6\u4FC2\u6570",
    deviationCategory: "\u504F\u5DEE",
    deviationScore: "\u5B9F\u52B9\u504F\u5DEE",
  },
  timelineLabels: {
    preferment: {
      title: "\u524D\u767A\u9175",
      desc: "{type}\u3092\u6DF7\u305C\u3066\u719F\u6210\u3055\u305B\u308B",
      tipBeginner:
        "\u524D\u767A\u9175\u306F\u30A4\u30FC\u30B9\u30C8\u306E\u300C\u524D\u83DC\u300D\u306E\u3088\u3046\u306A\u3082\u306E\u3067\u3059\u3002\u6DF7\u305C\u3066\u84CB\u3092\u3057\u3066\u4F11\u307E\u305B\u307E\u3057\u3087\u3046\u3002",
      tipNerd:
        "\u524D\u767A\u9175\u306F\u6709\u6A5F\u9178\uFF08\u4E73\u9178/\u9162\u9178\uFF09\u3092\u751F\u6210\u3057\u3001pH\u3092\u7D044.5\u306B\u4E0B\u3052\u3001\u30B0\u30EB\u30C6\u30F3\u30CD\u30C3\u30C8\u30EF\u30FC\u30AF\u3092\u6539\u5584\u3057\u307E\u3059\u3002",
    },
    mix: {
      title: "\u3053\u306D",
      desc: "\u6ED1\u3089\u304B\u3067\u5F3E\u529B\u304C\u51FA\u308B\u307E\u3067\u3053\u306D\u308B\u3002",
      descAlt:
        "\u6750\u6599\u3092\u3053\u306D\u305A\u306B\u6DF7\u305C\u308B\u3002\u6298\u308A\u305F\u305F\u307F\u3092\u7E70\u308A\u8FD4\u3059\u3002",
      tipBeginner:
        "\u751F\u5730\u304C\u6ED1\u3089\u304B\u3067\u624B\u304B\u3089\u96E2\u308C\u308B\u3088\u3046\u306B\u306A\u3063\u305F\u3089\u5B8C\u6210\u3067\u3059\u3002\u3079\u305F\u3064\u304F\u5834\u5408\u306F5\u5206\u5F85\u3063\u3066\u518D\u6311\u6226\u3002",
      tipNerd:
        "\u30A6\u30A3\u30F3\u30C9\u30A6\u30DA\u30A4\u30F3\u30C6\u30B9\u30C8\u3067\u30B0\u30EB\u30C6\u30F3\u306E\u767A\u9054\u3092\u78BA\u8A8D\uFF1A\u30B0\u30EB\u30C6\u30CB\u30F3\u3068\u30B0\u30EA\u30A2\u30B8\u30F3\u304C\u5B89\u5B9A\u3057\u305F\u30B8\u30B9\u30EB\u30D5\u30A3\u30C9\u7D50\u5408\u3092\u5F62\u6210\u3002",
    },
    mix_noknead: {
      title: "\u6DF7\u305C\u308B",
      desc: "\u3053\u306D\u305A\u306B\u7C89\u306E\u30C0\u30DE\u304C\u306A\u304F\u306A\u308B\u307E\u3067\u6DF7\u305C\u308B\u3002\u305D\u306E\u5F8C\u3001\u7D0430\u5206\u304A\u304D\u306B3\u56DE\u30B9\u30C8\u30EC\u30C3\u30C1&\u30D5\u30A9\u30FC\u30EB\u30C9\u3002",
      tipBeginner:
        "\u3053\u306D\u308B\u5FC5\u8981\u306F\u3042\u308A\u307E\u305B\u3093\uFF01\u30D8\u30E9\u3067\u4E7E\u3044\u305F\u7C89\u304C\u306A\u304F\u306A\u308B\u307E\u3067\u6DF7\u305C\u3066\u304F\u3060\u3055\u3044\u3002",
      tipNerd:
        "\u30AA\u30FC\u30C8\u30EA\u30FC\u30BA\u306F\u5C0F\u9EA6\u7C89\u306E\u5185\u5728\u6027\u30D7\u30ED\u30C6\u30A4\u30CA\u30FC\u30BC\u3092\u5229\u7528\u3057\u3001\u6A5F\u68B0\u7684\u4F5C\u696D\u306A\u3057\u3067\u30B0\u30EB\u30C6\u30F3\u3092\u767A\u9054\u3055\u305B\u307E\u3059\u3002",
    },
    bulk: {
      title: "\u4E00\u6B21\u767A\u9175",
      desc: "{temp}\u3067\u4E00\u6B21\u767A\u9175",
      tipBeginner:
        "\u751F\u5730\u304C2\u500D\u306B\u818A\u3089\u3080\u307E\u3067\u5F85\u3061\u307E\u3057\u3087\u3046\u3002\u6696\u304B\u3044\u5834\u6240\u3067\u306F\u3053\u307E\u3081\u306B\u78BA\u8A8D\uFF01",
      tipNerd:
        "{temp}\u3067\u306E\u767A\u9175\u901F\u5EA6\u306F18\u00B0C\u57FA\u6E96\u306E{factor}\u00D7\u3067\u3059\u3002",
    },
    bulk_cold: {
      title: "\u4E00\u6B21\u767A\u9175",
      desc: "{temp}\u3067\u4E00\u6B21\u767A\u9175",
      tipBeginner:
        "\u51B7\u8535\u5EAB\u3067\u306F\u751F\u5730\u304C\u3086\u3063\u304F\u308A\u818A\u3089\u307F\u307E\u3059\u304C\u3001\u98A8\u5473\u304C\u5897\u3057\u307E\u3059\u3002\u5BC6\u7740\u30E9\u30C3\u30D7\u3067\u3057\u3063\u304B\u308A\u8986\u3063\u3066\u304F\u3060\u3055\u3044\u3002",
      tipNerd:
        "{temp}\u3067\u306FQ\u2081\u2080\u22482.0\u304C\u767A\u9175\u3092\u6E1B\u901F\u3002\u30BF\u30F3\u30D1\u30AF\u5206\u89E3\u6D3B\u6027\u304C\u512A\u52E2\u3068\u306A\u308A\u3001FODMAP\u3092\u5206\u89E3\u3057\u307E\u3059\u3002",
    },
    divide: {
      title: "\u5206\u5272",
      desc: "\u6B63\u3057\u3044\u91CD\u3055\u306B\u5206\u5272\u3057\u3001\u4E38\u3081\u308B\u3002",
      tipBeginner:
        "\u306F\u304B\u308A\u3092\u4F7F\u3044\u307E\u3057\u3087\u3046\uFF01\u30B9\u30B1\u30C3\u30D1\u30FC\u3067\u5207\u308A\u3001\u305D\u308C\u305E\u308C\u6ED1\u3089\u304B\u306A\u7403\u306B\u4E38\u3081\u307E\u3059\u3002",
      tipNerd:
        "\u5206\u5272\u306B\u3088\u308A\u8868\u9762\u5F35\u529B\u304C\u751F\u307E\u308C\u3001\u6700\u7D42\u767A\u9175\u4E2D\u306BCO\u2082\u3092\u9589\u3058\u8FBC\u3081\u307E\u3059\u3002",
    },
    proof: {
      title: "\u6700\u7D42\u767A\u9175",
      desc: "{temp}\u3067\u6700\u7D42\u767A\u9175",
      tipBeginner:
        "\u751F\u5730\u7389\u306F\u67D4\u3089\u304B\u304F\u3042\u308B\u3079\u304D\u3067\u3059\u3002\u6307\u3067\u62BC\u3059\u3068\u3086\u3063\u304F\u308A\u623B\u308A\u307E\u3059\u3002",
      tipNerd:
        "\u30D5\u30A3\u30F3\u30AC\u30FC\u30C6\u30B9\u30C8\uFF1A\u9045\u3044\u623B\u308A=\u6700\u9069\u306A\u767A\u9175\u3002\u901F\u3059\u304E\u308B=\u767A\u9175\u4E0D\u8DB3\u3002\u623B\u3089\u306A\u3044=\u904E\u767A\u9175\u3002",
    },
    shape: {
      title: "\u6210\u5F62",
      desc: "\u4E2D\u5FC3\u304B\u3089\u624B\u3067\u4F38\u3070\u3057\u3001\u7E01\u3092\u6B8B\u3059",
      descAlt:
        "\u6CB9\u3092\u5857\u3063\u305F\u5929\u677F\u3067\u624B\u3067\u4F38\u3070\u3059",
    },
    shape_thin: {
      title: "\u6210\u5F62",
      desc: "\u9EBB\u68D2\u3067\u6975\u8584\u306B\u4F38\u3070\u3059",
    },
    top: {
      title: "\u30C8\u30C3\u30D4\u30F3\u30B0",
      desc: "\u304A\u597D\u307F\u306E\u30C8\u30C3\u30D4\u30F3\u30B0\u3092\u306E\u305B\u308B",
    },
    bake: {
      title: "\u713C\u6210",
      desc: "{temp}\u3067\u713C\u304F",
      tipBeginner:
        "\u30AA\u30FC\u30D6\u30F3\u306F\u975E\u5E38\u306B\u9AD8\u6E29\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059\u3002\u5C11\u306A\u304F\u3068\u308230\u5206\u524D\u306B\u4E88\u71B1\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
      tipNerd:
        "\u30E1\u30A4\u30E9\u30FC\u30C9\u53CD\u5FDC\u306F\u7D04140\u00B0C\u3067\u59CB\u307E\u308A\u6307\u6570\u95A2\u6570\u7684\u306B\u52A0\u901F\u3002{temp}\u3067\u306F\u30AB\u30E9\u30E1\u30EB\u5316\u304C\u7D04600\u306E\u82B3\u9999\u5316\u5408\u7269\u3092\u751F\u6210\u3057\u307E\u3059\u3002",
    },
  },
  timelineUi: {
    startLabel: "\u958B\u59CB",
    beforeSuffix: "\u524D",
  },
  parametricTips: {
    pillHydration: "\u6C34\u5206\u91CF",
    pillFlour: "\u5C0F\u9EA6\u7C89",
    pillPL: "P/L",
    pillFermentation: "\u767A\u9175",
    pillThickness: "\u539A\u3055",
    pillLevel: "\u30EC\u30D9\u30EB",
    pillExperimentation: "\u5B9F\u9A13\u6027",
    pillLevelBeginner: "\u521D\u5FC3\u8005",
    pillLevelExpert: "\u4E0A\u7D1A\u8005",
    sheetSectionTitle: "\u7126\u304D\u8A73\u7D30",
    sheetOvenLabel:
      "\u7406\u60F3\u306E\u30AA\u30FC\u30D6\u30F3",
    sheetOvenPreheat: "\u4E88\u71B1: {min}\u5206",
    sheetBakeLabel: "\u7126\u304D\u6642\u9593",
    sheetBakeTurns: "{n}\u56DE\u8EE2",
    sheetBakeNoTurns: "\u56DE\u8EE2\u306A\u3057",
    sheetDoughLabel: "\u751F\u5730\u7389",
    sheetSaltLabel: "\u5869",
    sheetFoldLabel: "\u6298\u308A\u305F\u305F\u307F",
    sheetFoldInterval: "{min}\u5206\u3054\u3068",
    sheetGenerateBtn: "\u30EC\u30B7\u30D4\u3092\u751F\u6210",
    sheetMatchTitle: "あなたのキッチンに合う理由",
    sheetTechniquesLabel:
      "\u5BFE\u5FDC\u3059\u308B\u8457\u540D\u6280\u6CD5",
    mixBeginner:
      "{mixer}\uFF08\u7D04{time}\u5206\u306E\u6DF7\u305C\uFF09\u3002{equipment}",
    bulkBeginner:
      "{interval}\u5206\u3054\u3068\u306B{count}\u56DE\u306E\u6298\u308A\u305F\u305F\u307F\uFF08{type}\uFF09\u3092\u884C\u3044\u3001\u69CB\u9020\u3092\u767A\u9054\u3055\u305B\u307E\u3059\u3002",
    shapeBeginner: "{note}",
    topBeginner: "\u9806\u5E8F: {order}\u3002{note}",
    bakeBeginner:
      "\u6642\u9593: {minM}\u2013{maxM}\u5206\u3002{turnsNote}",
    mixNerd:
      "{mixer} \u00B7 \u6DF7\u305C\u7D04{time}\u5206 \u00B7 {note}",
    bulkNerd:
      "\u6298\u308A\u305F\u305F\u307F: {count}\u00D7 {type} {interval}\u5206\u3054\u3068 \u00B7 {note}",
    shapeNerd:
      "\u30AF\u30FC\u30D7: {type} \u00B7 \u6DF1\u3055{depth}mm \u00B7 {timing} \u00B7 {note}",
    topNerd:
      "\u30C8\u30C3\u30D4\u30F3\u30B0\u9806: {order} \u00B7 \u30BD\u30FC\u30B9{saucePos} \u00B7 {cheeseType}\uFF08{cheesePos}\uFF09\u00B7 {note}",
    bakeNerd:
      "\u7406\u60F3\u7126\u304D: {idealSec}\u79D2\uFF08\u7BC4\u56F2{minM}\u2013{maxM}\u5206\uFF09\u00B7 {turns}\u56DE\u8EE2 \u00B7 {note}",
    mixerPlanetaria:
      "\u30B9\u30BF\u30F3\u30C9\u30DF\u30AD\u30B5\u30FC\u63A8\u5968",
    mixerHand: "\u624B\u3054\u306D\u53EF\u80FD",
    turnsSingle:
      "\u5747\u4E00\u306A\u7126\u304D\u306E\u305F\u3081{n}\u56DE\u56DE\u8EE2\u3002",
    turnsNone:
      "\u7126\u304D\u4E2D\u306F\u56DE\u8EE2\u3057\u306A\u3044\u3002",
  },
  styleDescriptions: {
    napoletana_stg:
      "AVPN\u898F\u5B9A\u306B\u57FA\u3065\u304F\u9EC4\u91D1\u57FA\u6E96\u3002\u3075\u304F\u3089\u3093\u3060\u30B3\u30EB\u30CB\u30C1\u30E7\u30FC\u30CD\u3001\u8584\u3044\u4E2D\u5FC3\u3001\u8C79\u67C4\u306E\u30AF\u30E9\u30B9\u30C8\u3002",
    napoletana_canotto:
      "\u7206\u767A\u7684\u306A\u300C\u30A8\u30A2\u30AB\u30CC\u30C3\u30C8\u300D\u30B3\u30EB\u30CB\u30C1\u30E7\u30FC\u30CD\u3001\u6975\u9650\u306E\u6C17\u6CE1\u3001\u9AD8\u3044\u6D88\u5316\u6027\u3002",
    teglia_romana:
      "\u9AD8\u6C34\u5206\u3001\u6298\u308A\u305F\u305F\u307F\u306E\u307F\u3002\u30AB\u30EA\u30AB\u30EA\u306E\u30D9\u30FC\u30B9\u3001\u96F2\u306E\u3088\u3046\u306A\u30AF\u30E9\u30E0\u3002",
    tonda_romana:
      "\u6975\u8584\u3001\u9EBB\u68D2\u5FC5\u9808\u3001\u6975\u9650\u306E\u30AB\u30EA\u30AB\u30EA\u3002\u300CScrocchiarella\u300D\u3002",
    pinsa_romana:
      "\u5C0F\u9EA6\u7C8970% / \u5927\u8C6B15% / \u7C7315%\u306E\u30D6\u30EC\u30F3\u30C9\u3002\u6955\u5186\u5F62\u3001\u30AC\u30E9\u30B9\u8CEA\u306E\u30AF\u30E9\u30B9\u30C8\u3002",
    pala_romana:
      "\u7D30\u9577\u3044\u6955\u5186\u5F62\u3092\u30D1\u30FC\u30EB\u3067\u63D0\u4F9B\u3002\u4E38\u578B\u3068\u9244\u677F\u306E\u4E2D\u9593\uFF1A\u5916\u306F\u30AB\u30EA\u30AB\u30EA\u3001\u4E2D\u306F\u96F2\u3002",
    new_york:
      "\u5927\u304D\u306A\u6298\u308A\u305F\u305F\u307F\u30B9\u30E9\u30A4\u30B9\u3001\u30AB\u30EA\u30AB\u30EA\u3060\u304C\u67D4\u8EDF\u306A\u30AF\u30E9\u30B9\u30C8\u3002\u30B9\u30C8\u30EA\u30FC\u30C8\u30D5\u30FC\u30C9\u3002",
    detroit:
      "\u30AB\u30EA\u30AB\u30EA\u306E\u30C1\u30FC\u30BA\u30AF\u30E9\u30A6\u30F3\u3001Blue Steel\u30D1\u30F3\u3002\u7AEF\u307E\u3067\u30C1\u30FC\u30BA\u3002",
    chicago_deep:
      "\u585E\u3044\u30D1\u30A4\u306E\u3088\u3046\u306A\u30C7\u30A3\u30FC\u30D7\u30C7\u30A3\u30C3\u30B7\u30E5\u3002\u9006\u5C64\uFF1A\u30C1\u30FC\u30BA-\u5177\u6750-\u30BD\u30FC\u30B9\u3002",
    bonci_teglia:
      "\u6298\u308A\u305F\u305F\u307F\u306E\u307F\u3001\u6975\u9650\u6C34\u5206\u3001\u5DE8\u5320\u30DC\u30F3\u30C1\u3002\u9AD8\u3044\u6D88\u5316\u6027\u3002",
    focaccia_genovese:
      "\u67D4\u3089\u304B\u304F\u30AA\u30A4\u30EA\u30FC\u3001\u91D1\u8272\u306E\u30AF\u30E9\u30B9\u30C8\u3068\u7279\u5FB4\u7684\u306A\u304F\u307C\u307F\u3002\u8868\u9762\u306B\u30AA\u30A4\u30EB\u6C34\u5869\u6C34\u3002",
    sfincione:
      "\u30C8\u30DE\u30C8\u3001\u7389\u306D\u304E\u3001\u30A2\u30F3\u30C1\u30E7\u30D3\u3001\u30AB\u30C1\u30E7\u30AB\u30F4\u30A1\u30C3\u30ED\u3001\u30D1\u30F3\u7C89\u5165\u308A\u306E\u539A\u3044\u30B7\u30C1\u30EA\u30A2\u30D4\u30C3\u30C4\u30A1\u3002\u30D1\u30EC\u30EB\u30E2\u306E\u30B9\u30C8\u30EA\u30FC\u30C8\u30D5\u30FC\u30C9\u3002",
    grandma_style:
      "\u8584\u304F\u30AB\u30EA\u30AB\u30EA\u3001\u6CB9\u3092\u5857\u3063\u305F\u5929\u677F\u3002\u30A4\u30BF\u30EA\u30A2\u7CFB\u30A2\u30E1\u30EA\u30AB\u4EBA\u306E\u304A\u3070\u3042\u3061\u3083\u3093\u306E\u30D4\u30C3\u30C4\u30A1\u3002\u30E2\u30C3\u30C4\u30A1\u30EC\u30E9\u306E\u4E0A\u306B\u30BD\u30FC\u30B9\u3002",
    focaccia_recco:
      "\u6975\u8584\u306E2\u679A\u306E\u30B7\u30FC\u30C8\u306B\u6EB6\u3051\u305F\u30B9\u30C8\u30E9\u30C3\u30AD\u30FC\u30CE\u30022015\u5E74\u304B\u3089IGP\u3002\u7279\u5FB4\u7684\u306A\u91D1\u8272\u306E\u6CE1\u3002",
    padellino_torino:
      "\u9244\u306E\u30D5\u30E9\u30A4\u30D1\u30F3\u3067\u7126\u304D\u3001\u30AA\u30FC\u30D6\u30F3\u3067\u4ED5\u4E0A\u3052\u3002\u30D0\u30BF\u30FC\u30AA\u30A4\u30EB\u306E\u30AB\u30EA\u30AB\u30EA\u5E95\u3001\u67D4\u3089\u304B\u306A\u4E2D\u5FC3\u3002\u30C8\u30EA\u30CE\u306E\u540D\u7269\u3002",
  },
  styleChars: {
    napoletana_stg:
      "\u30B3\u30EB\u30CB\u30C1\u30E7\u30FC\u30CD1-2cm\u81A8\u3089\u307F|\u4E2D\u5FC33-4mm\u8584|\u8C79\u67C4\u30AF\u30E9\u30B9\u30C8|\u7126\u304D60-90\u79D2",
    napoletana_canotto:
      "\u30B3\u30EB\u30CB\u30C1\u30E7\u30FC\u30CD3-4cm\u300C\u30AB\u30CC\u30C3\u30C8\u300D|\u6975\u9650\u6C17\u6CE1|\u719F\u621024-72h|\u9AD8\u6D88\u5316\u6027",
    teglia_romana:
      "\u9AD8\u30552-3cm|\u6C34\u5206\u91CF80-100%|\u6298\u308A\u305F\u305F\u307F\u306E\u307F|\u96F2\u30AF\u30E9\u30E0",
    tonda_romana:
      "\u539A\u30551-2mm|\u9EBB\u68D2\u5FC5\u9808|\u6975\u9650\u30AB\u30EA\u30AB\u30EA|\u5F31\u3044\u5C0F\u9EA6\u7C89W<210",
    pinsa_romana:
      "\u30DE\u30EB\u30C1\u7A40\u7269\u30DF\u30C3\u30AF\u30B9|\u6955\u5186\u5F62|\u30AC\u30E9\u30B9\u8CEA\u30AF\u30E9\u30B9\u30C8|\u719F\u621024-72h",
    pala_romana:
      "\u7D30\u9577\u3044\u6955\u5186\u5F62|\u9AD8\u6C34\u5206|\u30D1\u30FC\u30EB\u3067\u63D0\u4F9B|\u30AB\u30EA\u30AB\u30EA\u96F2\u30AF\u30E9\u30B9\u30C8",
    new_york:
      "\u6298\u308A\u305F\u305F\u307F\u30B9\u30E9\u30A4\u30B9|\u7802\u7CD6+\u30AA\u30A4\u30EB|\u7126\u304D12-15\u5206|\u7279\u5FB4\u7684\u306A\u6CB9\u611F",
    detroit:
      "\u30C1\u30FC\u30BA\u30AF\u30E9\u30A6\u30F3|\u6DF1\u3044\u30D1\u30F3|\u7AEF\u306E\u30C1\u30FC\u30BA|\u30AB\u30E9\u30E1\u30EB\u30AF\u30E9\u30B9\u30C8",
    chicago_deep:
      "\u6DF1\u30555cm|\u30D0\u30BF\u30FC18%|\u9006\u5C64|\u7126\u304D35\u5206",
    bonci_teglia:
      "\u6298\u308A\u305F\u305F\u307F\u306E\u307F|\u6975\u9650\u6C34\u5206|\u719F\u621024-72h|\u96F2\u6C17\u6CE1",
    focaccia_genovese:
      "\u305F\u3063\u3077\u308A\u30AA\u30EA\u30FC\u30D6\u30AA\u30A4\u30EB|\u8868\u9762\u304F\u307C\u307F|\u30AA\u30A4\u30EB\u6C34\u5869\u6C34|\u7126\u304D15-20\u5206",
    sfincione:
      "\u539A\u304F\u3075\u308F\u3075\u308F|\u30C8\u30FC\u30B9\u30C8\u30D1\u30F3\u7C89|\u7389\u306D\u304E+\u30A2\u30F3\u30C1\u30E7\u30D3|\u30AB\u30C1\u30E7\u30AB\u30F4\u30A1\u30C3\u30ED",
    grandma_style:
      "\u8584\u304F\u30AB\u30EA\u30AB\u30EA|\u30E2\u30C3\u30C4\u30A1\u30EC\u30E9\u306E\u4E0B\u306B\u30BD\u30FC\u30B9|\u305F\u3063\u3077\u308A\u6CB9\u306E\u5929\u677F|\u7126\u304D12-16\u5206",
    focaccia_recco:
      "\u307B\u307C\u900F\u660E\u306A\u30B7\u30FC\u30C8|\u30B9\u30C8\u30E9\u30C3\u30AD\u30FC\u30CE\u5165\u308A|\u91D1\u8272\u306E\u6CE1|\u767A\u9175\u306A\u3057",
    padellino_torino:
      "\u9244\u306E\u30D5\u30E9\u30A4\u30D1\u30F3|\u8D85\u30AB\u30EA\u30AB\u30EA\u306E\u5E95|\u67D4\u3089\u304B\u306A\u4E2D\u5FC3|\u500B\u4EBA\u30DD\u30FC\u30B7\u30E7\u30F3",
  },
  deviationLabels: {
    canonical: "\u6B63\u5178",
    parameter_variant:
      "\u30D1\u30E9\u30E1\u30FC\u30BF\u30FC\u5909\u52D5",
    technique_variant:
      "\u6280\u6CD5\u30D0\u30EA\u30A2\u30F3\u30C8",
    hybrid: "\u30CF\u30A4\u30D6\u30EA\u30C3\u30C9",
    experimental: "\u5B9F\u9A13\u7684",
  },
  authorNames: {
    bonci_no_knead:
      "\u6298\u308A\u305F\u305F\u307F\u9AD8\u6C34\u5206",
    martucci_biga_ibrida:
      "\u30CF\u30A4\u30D6\u30EA\u30C3\u30C9\u30D3\u30AC50% + \u30AA\u30FC\u30C8\u30EA\u30FC\u30BA",
    martucci_biga_100:
      "\u30D3\u30AC100%\u30EA\u30D5\u30EC\u30C3\u30B7\u30E5\u4ED8\u304D",
    pepe_sensoriale:
      "\u611F\u899A\u7684\u6C34\u5206\u8ABF\u6574",
    bosco_idrolisi:
      "\u52A0\u6C34\u5206\u89E3\u6CD5\uFF08\u81EA\u7136\u767A\u9175\uFF09",
    capuano_forbici:
      "\u30CF\u30B5\u30DF\u6CD5\uFF08\u4E73\u88FD\u54C1\uFF09",
    pepe_sensory_layering:
      "\u98DF\u6750\u5225\u713C\u304D\u5206\u3051\u6CD5",
    bianco_long_ferment: "5\u65E5\u9593\u767A\u9175",
    forkish_saturday:
      "\u30B5\u30BF\u30C7\u30FC\u30D4\u30B6\uFF08\u4F4E\u6E29\u767A\u9175\uFF09",
  },
  authorAuthors: {
    bonci_no_knead:
      "\u30AC\u30D6\u30EA\u30A8\u30EC\u30FB\u30DC\u30F3\u30C1",
    martucci_biga_ibrida:
      "\u30D5\u30E9\u30F3\u30C1\u30A7\u30B9\u30B3\u30FB\u30DE\u30EB\u30C8\u30A5\u30C3\u30C1",
    martucci_biga_100:
      "\u30D5\u30E9\u30F3\u30C1\u30A7\u30B9\u30B3\u30FB\u30DE\u30EB\u30C8\u30A5\u30C3\u30C1",
    pepe_sensoriale:
      "\u30D5\u30E9\u30F3\u30B3\u30FB\u30DA\u30DA",
    bosco_idrolisi:
      "\u30EC\u30CA\u30FC\u30C8\u30FB\u30DC\u30B9\u30B3",
    capuano_forbici:
      "\u30F4\u30A3\u30F3\u30C1\u30A7\u30F3\u30C4\u30A9\u30FB\u30AB\u30D7\u30A2\u30FC\u30CE",
    pepe_sensory_layering:
      "\u30D5\u30E9\u30F3\u30B3\u30FB\u30DA\u30DA",
    bianco_long_ferment:
      "\u30AF\u30EA\u30B9\u30FB\u30D3\u30A2\u30F3\u30B3",
    forkish_saturday:
      "\u30B1\u30F3\u30FB\u30D5\u30A9\u30FC\u30AD\u30C3\u30B7\u30E5",
  },
  profile: {
    pageTitle: "\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB",
    pageSubtitle:
      "\u3042\u306A\u305F\u306E\u8A2D\u5B9A\u3001\u3044\u3064\u3067\u3082\u624B\u306E\u5C4A\u304F\u3068\u3053\u308D\u306B\u3002",
    favoritesTitle: "ãæ°ã«å¥ãã®ã¹ã¿ã¤ã«",
    favoritesSubtitle: "ãã¼ããä»ããã¹ã¿ã¤ã«",
    favoriteRemove: "ãæ°ã«å¥ãããåé¤",
    favoriteRemoveAria: "{name}ããæ°ã«å¥ãããåé¤",
    savedRecipesTitle: "ä¿å­ããã¬ã·ã",
    savedRecipesSubtitle: "ããªãå¥½ã¿ã«èª¿æ´ãããã¼ã¸ã§ã³",
    savedRecipeRemove: "ã¬ã·ãå¸³ããåé¤",
    savedRecipeRemoveAria: "{name}ãã¬ã·ãå¸³ããåé¤",
    ovenTitle:
      "\u3042\u306A\u305F\u306E\u30AA\u30FC\u30D6\u30F3",
    ovenSubtitle:
      "\u6E29\u5EA6\u3068\u5229\u7528\u53EF\u80FD\u306A\u30B9\u30BF\u30A4\u30EB\u3092\u6C7A\u5B9A\u3057\u307E\u3059",
    ovenStep: "01 \u2014 \u8A2D\u5099",
    tempLabel: "\u6700\u9AD8\u6E29\u5EA6",
    tempAria:
      "\u30AA\u30FC\u30D6\u30F3\u306E\u6700\u9AD8\u6E29\u5EA6",
    skillTitle: "\u3042\u306A\u305F\u306E\u7D4C\u9A13",
    skillSubtitle:
      "\u30EC\u30B7\u30D4\u306E\u8907\u96D1\u3055\u3092\u8ABF\u6574\u3057\u307E\u3059",
    skillStep: "02 \u2014 \u30EC\u30D9\u30EB",
    pantryTitle:
      "\u3042\u306A\u305F\u306E\u30D1\u30F3\u30C8\u30EA\u30FC",
    pantrySubtitle:
      "\u81EA\u5B85\u306B\u3042\u308B\u5C0F\u9EA6\u7C89\u3068\u30A4\u30FC\u30B9\u30C8",
    pantryStep: "03 \u2014 \u6750\u6599",
    dietTitle: "\u98DF\u4E8B\u306E\u597D\u307F",
    dietSubtitle:
      "\u975E\u5BFE\u5FDC\u306E\u30B9\u30BF\u30A4\u30EB\u3068\u6750\u6599\u3092\u30D5\u30A3\u30EB\u30BF\u30FC",
    dietStep: "04 \u2014 \u98DF\u4E8B",
    noDietNote:
      "\u5236\u9650\u306A\u3057 \u2014 \u3059\u3079\u3066\u306E\u30B9\u30BF\u30A4\u30EB\u304C\u5229\u7528\u53EF\u80FD\u3067\u3059\u3002",
    prefsTitle: "\u8A00\u8A9E\u3068\u30C6\u30FC\u30DE",
    prefsSubtitle:
      "\u30A4\u30F3\u30BF\u30FC\u30D5\u30A7\u30FC\u30B9\u3092\u30AB\u30B9\u30BF\u30DE\u30A4\u30BA",
    prefsStep: "05 \u2014 \u8A2D\u5B9A",
    langLabel: "\u8A00\u8A9E",
    themeLabel: "\u30C6\u30FC\u30DE",
    themeLight: "\u30E9\u30A4\u30C8",
    themeDark: "\u30C0\u30FC\u30AF",
    themeAuto: "\u81EA\u52D5",
    unitTitle: "\u5358\u4F4D",
    unitSubtitle:
      "\u6E29\u5EA6\u3001\u91CD\u3055\u3001\u6DB2\u4F53\u306E\u8868\u793A\u65B9\u6CD5\u3092\u9078\u3073\u307E\u3059",
    unitStep: "07 \u2014 \u5358\u4F4D",
    unitSystemLabel: "\u5358\u4F4D\u7CFB",
    unitMetric: "\u30E1\u30FC\u30C8\u30EB\u6CD5",
    unitMetricDesc: "g\u3001ml\u3001\u6442\u6C0F",
    unitImperial: "\u30A4\u30F3\u30DA\u30EA\u30A2\u30EB / US",
    unitImperialDesc: "oz\u3001fl oz\u3001\u83EF\u6C0F",
    pizzaNerdTitle: "PizzaNerd",
    pizzaNerdSubtitle:
      "\u9AD8\u5EA6\u306A\u6280\u8853\u30C7\u30FC\u30BF\u306E\u8868\u793A\u3092\u5236\u5FA1\u3057\u307E\u3059",
    pizzaNerdStep: "08 \u2014 PizzaNerd",
    pizzaNerdCardTitle: "PizzaNerd",
    pizzaNerdCardDesc:
      "\u30EC\u30B7\u30D4\u3068\u624B\u9806\u306B\u6280\u8853\u5206\u6790\u3068\u9AD8\u5EA6\u306A\u30C7\u30FC\u30BF\u3092\u8868\u793A\u3057\u307E\u3059\u3002",
    resetProfile:
      "\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB\u3092\u30EA\u30BB\u30C3\u30C8",
    resetConfirmMessage:
      "\u672C\u5F53\u306B\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB\u3092\u30EA\u30BB\u30C3\u30C8\u3057\u307E\u3059\u304B\uFF1F\n\n\u521D\u671F\u8A2D\u5B9A\u30A6\u30A3\u30B6\u30FC\u30C9\u306B\u623B\u308A\u307E\u3059\u3002\u73FE\u5728\u306E\u8A2D\u5B9A\u306F\u65B0\u3057\u3044\u9078\u629E\u3067\u7F6D\u304D\u63DB\u3048\u3089\u308C\u307E\u3059\u3002",
    devModeOn: "\u958B\u767A\u30E2\u30FC\u30C9\u6709\u52B9",
    devModeOff:
      "\u958B\u767A\u30E2\u30FC\u30C9\u3092\u6709\u52B9\u306B\u3059\u308B",
    locationTitle: "位置情報",
    locationSubtitle: "室温の取得および発酵時間の計算用",
    locationStep: "05 — 位置",
    locationPlaceholder: "都市を検索...",
    locationAuto: "位置情報を検出",
    locationAutoDetected: "自動検出",
    locationSaved: "位置情報を保存しました",
    locationNone: "位置情報が設定されていません — 標準値を使用します。",
    locationSearching: "検索中...",
    locationNoResults: "結果がありません",
    ftuWelcome: "\u3088\u3046\u3053\u305D",
    ftuOvenTitle:
      "\u3069\u3093\u306A\u30AA\u30FC\u30D6\u30F3\u3092\u304A\u6301\u3061\u3067\u3059\u304B\uFF1F",
    ftuOvenSubtitle:
      "\u30AA\u30FC\u30D6\u30F3\u304C\u53EF\u80FD\u306A\u30B9\u30BF\u30A4\u30EB\u3092\u6C7A\u3081\u307E\u3059",
    ftuSkillTitle:
      "\u7D4C\u9A13\u306F\u3069\u306E\u304F\u3089\u3044\uFF1F",
    ftuSkillSubtitle:
      "\u9069\u5207\u306A\u30EC\u30D9\u30EB\u3067\u30AC\u30A4\u30C9\u3057\u307E\u3059",
    ftuPantryTitle:
      "\u30D1\u30F3\u30C8\u30EA\u30FC\u306B\u306F\u4F55\u304C\u3042\u308A\u307E\u3059\u304B\uFF1F",
    ftuPantrySubtitle:
      "\u5229\u7528\u53EF\u80FD\u306A\u5C0F\u9EA6\u7C89\u3068\u30A4\u30FC\u30B9\u30C8",
    ftuBack: "\u623B\u308B",
    ftuNext: "\u6B21\u3078",
    ftuStart: "\u59CB\u3081\u308B",
    localeModalTitle:
      "\u8A00\u8A9E\u3092\u5909\u66F4\u3057\u307E\u3059\u304B\uFF1F",
    localeModalDesc:
      "\u30A4\u30F3\u30BF\u30FC\u30D5\u30A7\u30FC\u30B9\u306E\u3059\u3079\u3066\u306E\u30C6\u30AD\u30B9\u30C8\u304C{from}\u304B\u3089{to}\u306B\u5207\u308A\u66FF\u308F\u308A\u307E\u3059\u3002",
    localeModalCancel: "\u30AD\u30E3\u30F3\u30BB\u30EB",
    localeModalConfirm: "\u78BA\u8A8D",
    flour00: "\u30BF\u30A4\u30D700",
    flour0: "\u30BF\u30A4\u30D70",
    flourManitoba: "\u30DE\u30CB\u30C8\u30D0",
    flourIntegrale: "\u5168\u7C92\u7C89",
    flourSemola: "\u30BB\u30E2\u30EA\u30CA\u7C89",
    yeastFresh: "\u751F\u30A4\u30FC\u30B9\u30C8",
    yeastDry: "\u30C9\u30E9\u30A4\u30A4\u30FC\u30B9\u30C8",
    yeastSourdough: "\u5929\u7136\u9175\u6BCD",
    dietGlutenFree:
      "\u30B0\u30EB\u30C6\u30F3\u30D5\u30EA\u30FC",
    dietLactoseFree:
      "\u30E9\u30AF\u30C8\u30FC\u30B9\u30D5\u30EA\u30FC",
    dietVegan: "\u30F4\u30A3\u30FC\u30AC\u30F3",
    dietLowFodmap: "Low FODMAP",
    dietHistamine: "\u4F4E\u30D2\u30B9\u30BF\u30DF\u30F3",
    dietNickel: "\u4F4E\u30CB\u30C3\u30B1\u30EB",
    equipTitle: "\u8A2D\u5099",
    equipSubtitle:
      "\u30AD\u30C3\u30C1\u30F3\u306B\u3042\u308B\u3082\u306E",
    equipStep: "03 — \u8A2D\u5099",
    equipMixerTitle: "\u3053\u306D",
    equipSurfaceTitle: "\u711A\u304D\u9762",
    equipToolsTitle: "\u9053\u5177",
    equipSummaryNone: "\u672A\u9078\u629E",
    equipSummarySelected:
      "{count}\u500B\u9078\u629E\u6E08\u307F",
    mixerHands: "\u624B\u3054\u306D",
    mixerHandsDesc:
      "\u624B\u4F5C\u696D\u3001\u8A2D\u5099\u306A\u3057",
    mixerStandDomestic:
      "\u5353\u4E0A\u30DF\u30AD\u30B5\u30FC\uFF08\u5BB6\u5EAD\u7528\uFF09",
    mixerStandDomesticDesc: "KitchenAid, Kenwood, Smeg — 4-7 L",
    mixerPlanetary:
      "\u30D7\u30E9\u30CD\u30BF\u30EA\u30FC\u30DF\u30AD\u30B5\u30FC\uFF08\u30BB\u30DF\u30D7\u30ED\uFF09",
    mixerPlanetaryDesc:
      "10-20 L\u3001\u30B9\u30D1\u30A4\u30E9\u30EB\u30D5\u30C3\u30AF\u3001500W+",
    mixerSpiral:
      "\u30B9\u30D1\u30A4\u30E9\u30EB\u30DF\u30AD\u30B5\u30FC",
    mixerSpiralDesc:
      "\u56FA\u5B9A/\u50BE\u659C\u30DC\u30A6\u30EB\u3001\u30D7\u30ED\u4ED5\u69D8",
    mixerFork:
      "\u30D5\u30A9\u30FC\u30AF\u30DF\u30AD\u30B5\u30FC",
    mixerForkDesc:
      "\u4F4E\u901F\u3001\u4F4E\u6469\u64E6 — \u9AD8\u52A0\u6C34\u306B\u6700\u9069",
    mixerLevelHome: "\u5BB6\u5EAD",
    mixerLevelSemiPro: "\u30BB\u30DF\u30D7\u30ED",
    mixerLevelPro: "\u30D7\u30ED",
    surfaceRefractory: "\u8010\u706B\u30EC\u30F3\u30AC",
    surfaceRefractoryDesc:
      "3 cm\u3001\u9AD8\u84C4\u71B1 — \u85AA\u7AAF\u30FB\u30D7\u30ED\u30B7\u30E5\u30FC\u30DE\u30FC",
    surfaceCordierite:
      "\u30B3\u30FC\u30C7\u30A3\u30A8\u30E9\u30A4\u30C8\u77F3",
    surfaceCordieriteDesc:
      "1.5 cm\u3001\u84C4\u71B1/\u901F\u5EA6\u306E\u30D0\u30E9\u30F3\u30B9 — Effeuno, Ooni",
    surfaceSteel:
      "\u30B9\u30C1\u30FC\u30EB\u30D7\u30EC\u30FC\u30C8",
    surfaceSteelDesc:
      "5-10 mm\u3001\u8D85\u9AD8\u901F\u4F1D\u71B1 — \u6570\u79D2\u3067\u30AF\u30EA\u30B9\u30D4\u30FC",
    surfaceAluminum: "\u30A2\u30EB\u30DF\u30C8\u30EC\u30A4",
    surfaceAluminumDesc:
      "\u8EFD\u91CF\u3001\u6975\u9AD8\u4F1D\u5C0E\u7387 — \u30C7\u30C8\u30ED\u30A4\u30C8\u3001\u30ED\u30FC\u30DE\u30F3\u30C6\u30EA\u30A2",
    surfaceBlueSteel:
      "\u30D6\u30EB\u30FC\u30B9\u30C1\u30FC\u30EB\u30C8\u30EC\u30A4",
    surfaceBlueSteelDesc:
      "\u5929\u7136\u30CE\u30F3\u30B9\u30C6\u30A3\u30C3\u30AF\u3001\u9AD8\u7E01 — \u30C6\u30EA\u30A2\u3001\u30D5\u30A9\u30AB\u30C3\u30C1\u30E3",
    surfaceCastIron:
      "\u92F3\u9244\u30D5\u30E9\u30A4\u30D1\u30F3",
    surfaceCastIronDesc:
      "\u9AD8\u84C4\u71B1\u3001\u9AD8\u7E01 — \u30B7\u30AB\u30B4\u3001\u30D1\u30C7\u30EA\u30FC\u30CE",
    surfaceOvenRack:
      "\u30AA\u30FC\u30D6\u30F3\u30E9\u30C3\u30AF",
    surfaceOvenRackDesc:
      "\u8FFD\u52A0\u306E\u8868\u9762\u306A\u3057 — \u6A19\u6E96\u30E9\u30C3\u30AF\u306E\u307F",
    toolCatEssential: "\u57FA\u672C",
    toolCatPrecision: "\u7CBE\u5BC6",
    toolCatHandling: "\u53D6\u308A\u6271\u3044",
    toolCatContainment: "\u4FDD\u7BA1",
    toolDigitalScale:
      "\u30C7\u30B8\u30BF\u30EB\u30B9\u30B1\u30FC\u30EB",
    toolDigitalScaleDesc:
      "1g\u7CBE\u5EA6\u30015kg+\u5BB9\u91CF",
    toolThermometer: "\u6E29\u5EA6\u8A08",
    toolThermometerDesc:
      "IR\u307E\u305F\u306F\u30D7\u30ED\u30FC\u30D6\u3001\u751F\u5730\u3068\u30AA\u30FC\u30D6\u30F3\u7528",
    toolScraper: "\u30B9\u30AF\u30EC\u30FC\u30D1\u30FC",
    toolScraperDesc:
      "\u67D4\u8EDF\u30D7\u30E9\u30B9\u30C1\u30C3\u30AF\u3001\u6298\u308A\u305F\u305F\u307F\u3068\u30AB\u30C3\u30C8\u7528",
    toolContainers: "\u767A\u9175\u5BB9\u5668",
    toolContainersDesc:
      "\u30B9\u30BF\u30C3\u30AF\u53EF\u80FD\u306A\u30C8\u30EC\u30A4\u307E\u305F\u306F\u84CB\u4ED8\u304D\u30DC\u30A6\u30EB",
    toolDoughCutter: "\u30C9\u30A6\u30AB\u30C3\u30BF\u30FC",
    toolDoughCutterDesc:
      "\u30B9\u30C6\u30F3\u30EC\u30B9\u3001\u6B63\u78BA\u306A\u5206\u5272\u7528",
    toolBenchKnife: "\u30D9\u30F3\u30C1\u30CA\u30A4\u30D5",
    toolBenchKnifeDesc:
      "\u30B9\u30C6\u30F3\u30EC\u30B9\u3001\u9AD8\u52A0\u6C34\u751F\u5730\u306E\u53CD\u8EE2\u7528",
    toolScoringBlade:
      "\u30B9\u30B3\u30A2\u30EA\u30F3\u30B0\u30D6\u30EC\u30FC\u30C9",
    toolScoringBladeDesc:
      "\u88C5\u98FE\u7684\u306A\u8868\u9762\u5207\u308A\u8FBC\u307F\u7528",
    toolPeelWood: "\u6728\u88FD\u30D4\u30FC\u30EB",
    toolPeelWoodDesc:
      "\u6295\u5165\u7528 \u2014 \u30BB\u30E2\u30EA\u30CA\u3067\u4F4E\u6469\u64E6",
    toolPeelMetal: "\u30A2\u30EB\u30DF\u30D4\u30FC\u30EB",
    toolPeelMetalDesc:
      "\u56DE\u8EE2\u30FB\u53D6\u308A\u51FA\u3057\u7528 \u2014 \u8584\u304F\u3066\u53CD\u5FDC\u826F\u597D",
    toolPizzaScreen:
      "\u30D4\u30B6\u30B9\u30AF\u30EA\u30FC\u30F3",
    toolPizzaScreenDesc:
      "\u7A74\u3042\u304D\u30A2\u30EB\u30DF\u3001\u30AF\u30EA\u30B9\u30D4\u30FC\u306A\u713C\u304D\u4E0A\u304C\u308A",
    toolProofingBoxes: "\u767A\u9175\u30DC\u30C3\u30AF\u30B9",
    toolProofingBoxesDesc:
      "\u84CB\u4ED8\u304D\u30B9\u30BF\u30C3\u30AF\u53EF\u80FD \u2014 30\u00D740\u307E\u305F\u306F40\u00D760 cm",
    toolBannetons: "\u30D0\u30CC\u30C8\u30F3",
    toolBannetonsDesc:
      "\u4E38\u578B\u7528\u3001\u30EA\u30CD\u30F3\u30E9\u30A4\u30CA\u30FC\u4ED8\u304D",
    flourFarro: "スペルト小麦",
    flourKamut: "カムット小麦",
    flourSegale: "ライ麦",
    flourTipo1: "タイプ1",
    flourTipo2: "タイプ2",
    flourMacinataPietra: "石臼挽き",
    ftuDoneTitle: "必要な情報は以上です。ここから開始できます：",
    ftuDoneCreateTitle: "レシピを作成する",
    ftuDoneCreateDesc: "<b>作成</b>に進みスタイルを選択すると、すべて自動で計算されます",
    ftuDoneExploreTitle: "スタイルを探索する",
    ftuDoneExploreDesc: "<b>スタイル</b>セクション：写真と詳細で歴史や伝統を学べます",
    ftuDoneLearnTitle: "理論を学ぶ",
    ftuDoneLearnDesc: "<b>学ぶ</b>セクション：用語集、トラブルシューティング、前発酵について",
    ftuDoneProfileNote: "ミキサー、ベーキング面、食事制限、位置情報？<b>プロフィール</b>セクションからいつでも調整可能です。",
    specialFloursOnboarding: "特殊粉（スペルト、ライ麦、全粒粉など）",
    locationRemove: "位置情報を削除",
    ftuSkipMessage: "スキップして後で設定することもできます。",
  },
  pages: {
    navCreate: "\u4F5C\u308B",
    navExplore: "\u30B9\u30BF\u30A4\u30EB",
    navLearn: "\u5B66\u3076",
    navProfile: "\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB",
    navSearch: "\u691C\u7D22",
    exploreStepNum:
      "15\u30B9\u30BF\u30A4\u30EB \u2014 4\u30D5\u30A1\u30DF\u30EA\u30FC",
    exploreTitle: "\u30B9\u30BF\u30A4\u30EB\u3092\u63A2\u7D22",
    exploreSubtitle:
      "\u30CA\u30DD\u30EA\u30BF\u30FCNA STG\u304B\u3089\u30D5\u30A9\u30AB\u30C3\u30C1\u30E3\u30FB\u30C7\u30A3\u30FB\u30EC\u30C3\u30B3\u307E\u3067\u3002",
    learnTitle: "\u5B66\u3076",
    learnSubtitle:
      "\u30D4\u30B6\u306E\u79D1\u5B66\u3068\u82B8\u8853\u3001\u308F\u304B\u308A\u3084\u3059\u304F\u89E3\u8AAC\u3002",
    learnGlossary: "\u7528\u8A9E\u96C6",
    learnGlossaryDesc:
      "30\u4EE5\u4E0A\u306E\u88FD\u30D1\u30F3\u5C02\u9580\u7528\u8A9E",
    learnTroubleshooting:
      "\u554F\u984C\u3068\u89E3\u6C7A\u7B56",
    learnTroubleshootingDesc:
      "20\u306E\u3088\u304F\u3042\u308B\u554F\u984C\u3068\u305D\u306E\u89E3\u6C7A\u65B9\u6CD5",
    learnPreFerments: "\u524D\u767A\u9175",
    learnPreFermentsDesc:
      "\u30D3\u30AC\u3001\u30DD\u30FC\u30EA\u30C3\u30B7\u30E5\u3001\u30AA\u30FC\u30C8\u30EA\u30FC\u30BA\u306E\u30AC\u30A4\u30C9",
    recipeLabel: "\u30EC\u30B7\u30D4",
    recipeBackToStyles: "\u30B9\u30BF\u30A4\u30EB",
    recipeStyleNotFound:
      "\u30B9\u30BF\u30A4\u30EB\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093",
    recipeStyleNotFoundDesc:
      "\u30B9\u30BF\u30A4\u30EB\u300C{id}\u300D\u306F\u30C7\u30FC\u30BF\u30D9\u30FC\u30B9\u306B\u5B58\u5728\u3057\u307E\u305B\u3093\u3002",
    recipeExploreStyles:
      "\u30B9\u30BF\u30A4\u30EB\u3092\u63A2\u7D22",
    recipeCopyLinkAria:
      "\u30EC\u30B7\u30D4\u30EA\u30F3\u30AF\u3092\u30B3\u30D4\u30FC",
    notFoundTitle:
      "\u30DA\u30FC\u30B8\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093",
    notFoundSubtitle:
      "\u3053\u306E\u30D4\u30B6\u306F\u30E1\u30CB\u30E5\u30FC\u306B\u3042\u308A\u307E\u305B\u3093\u3002",
    notFoundBack: "\u30DB\u30FC\u30E0\u306B\u623B\u308B",
    searchPlaceholder:
      "\u30B9\u30BF\u30A4\u30EB\u3001\u5C0F\u9EA6\u7C89\u3001\u7528\u8A9E\u3001\u554F\u984C\u3092\u691C\u7D22\u2026",
    searchCatStyles: "\u30B9\u30BF\u30A4\u30EB",
    searchCatFlours: "\u5C0F\u9EA6\u7C89",
    searchCatGlossary: "\u7528\u8A9E\u96C6",
    searchCatProblems: "\u554F\u984C",
    searchCatGuides: "\u30AC\u30A4\u30C9",
    searchNoResults:
      "\u300C{query}\u300D\u306E\u691C\u7D22\u7D50\u679C\u306F\u3042\u308A\u307E\u305B\u3093",
    searchHint:
      "\u30B9\u30BF\u30A4\u30EB\u3001\u5C0F\u9EA6\u7C89\u3001\u7528\u8A9E\u96C6\u3001\u554F\u984C\u3092\u691C\u7D22",
    searchSuggestions: "\u5019\u88DC",
    searchFlourWheat: "\u8584\u529B\u7C89",
    searchFlourManitoba: "\u30DE\u30CB\u30C8\u30D0",
    searchFlourSemola: "\u30BB\u30E2\u30EA\u30CA",
    searchFlourWholegrain: "\u5168\u7C92\u7C89",
    searchFlourGlutenFree:
      "\u30B0\u30EB\u30C6\u30F3\u30D5\u30EA\u30FC",
    searchFlourSpecial: "\u7279\u6B8A",
    skipToContent:
      "\u30B3\u30F3\u30C6\u30F3\u30C4\u3078\u30B9\u30AD\u30C3\u30D7",
    navMainLabel:
      "\u30E1\u30A4\u30F3\u30CA\u30D3\u30B2\u30FC\u30B7\u30E7\u30F3",
    searchCloseLabel: "\u691C\u7D22\u3092\u9589\u3058\u308B",
    searchFieldLabel:
      "\u30B0\u30ED\u30FC\u30D0\u30EB\u691C\u7D22\u30D5\u30A3\u30FC\u30EB\u30C9",
    searchClearLabel: "\u691C\u7D22\u3092\u30AF\u30EA\u30A2",
    homeAria: "Vulcan Pizza Lab — \u30DB\u30FC\u30E0",
    devToolsAria: "\u958B\u767A\u8005\u30C4\u30FC\u30EB",
    mottoAria: "Vulcan \u30E2\u30C3\u30C8\u30FC",
    troubleshootSearchPlaceholder: "\u75C7\u72B6\u3084\u539F\u56E0\u3092\u691C\u7D22...",
    dietaryWarningsTitle:
      "\u98DF\u4E8B\u306B\u95A2\u3059\u308B\u6CE8\u610F",
    troubleshootingTitle:
      "\u30EC\u30B7\u30D4\u306B\u554F\u984C\u304C\u3042\u308A\u307E\u3059\u304B\uFF1F",
    troubleshootingDesc:
      "20\u306E\u3088\u304F\u3042\u308B\u554F\u984C\u3068\u89E3\u6C7A\u7B56\u306E\u30AC\u30A4\u30C9\u3092\u3054\u89A7\u304F\u3060\u3055\u3044",
    exploreRecipe: "レシピを見る",
    exploreHeroDesc: "伝統的な定番からシェフ考案 of オリジナルレシピまで。あなたのインスピレーションを見つけてください。",
    exploreFilterFeatured: "おすすめ",
    exploreFilterStyles: "ピザスタイル",
    exploreFilterRecipes: "代表的なレシピ",
    learnFilterSubtitle: "以下のセクションは、このスタイルに特化しています。",
    learnRemoveFilter: "スタイルフィルターを解除",
    learnOpenGlossary: "用語集を開く",
    learnPathLabel: "学習ロードマップ",
    learnStartPath: "ロードマップを開始",
    learnTermOfTheDay: "本日の用語 — {category}",
    learnPath1Title: "はじめてのトレイピザ",
    learnPath1Copy: "ニーダー不要、ストレスフリー：初心者でも失敗しにくく美味しく焼けるテグリア・ロマーナ。最初の一歩に最適です。",
    learnPath2Title: "ステップアップ：パデッリーノ",
    learnPath2Copy: "フチはふんわり、底はサクサク。家にあるフライパンで手軽に作れる、最も身近なアップグレード。",
    learnPath3Title: "カノットへの挑戦",
    learnPath3Copy: "膨らんだコルニチョーネ（フチ）、高加水、前発酵。これまで学んだすべての技術が試されます。",
    learnPath4Title: "ボンチ・メソッドの極み",
    learnPath4Copy: "極限の加水率、折りたたみ、忍耐。水と小麦粉をまるで雲のように軽い食感に変える、マエストロのトレイピザ。",
    preFermentsSubtitle: "ビガ、ポーリッシュ、オートリーズ：特徴と使い分け。",
    preFermentsDescription: "前発酵（発酵種）とは、本ごねの前に準備する発酵生地のことです。ピザの風味、骨格、消化の良さを向上させます。各手法には独自の特徴があります：<strong>ビガ</strong>（固形）は複雑な芳香を与え、<strong>ポーリッシュ</strong>（液状）は軽さと黄金色の焼き色をもたらし、<strong>オートリーズ</strong>（粉と水のみ）は機械的な捏ね作業なしでグルテン組織を形成します。",
    preFermentsChoiceTitle: "どれを選ぶべき？",
    preFermentsBigaTitle: "ビガ",
    preFermentsBigaWhen: "複雑な風味と歯切れの良い生地を求めるとき",
    preFermentsBigaBest: "クラシック・ナポレターナ、ピンサ、ピッツァ・アル・タリオ",
    preFermentsPoolishTitle: "ポーリッシュ",
    preFermentsPoolishWhen: "軽さとしっかりとした黄金色の焼き色を求めるとき",
    preFermentsPoolishBest: "テグリア・ロマーナ、NYスタイル、フォカッチャ",
    preFermentsAutolisiTitle: "オートリーズ",
    preFermentsAutolisiWhen: "捏ね時間を短縮し、生地の伸展性を向上させたいとき",
    preFermentsAutolisiBest: "すべてのスタイル — 万能な技術で、ビガやポーリッシュとも併用可能",
    stylesModified: "編集済み",
    stylesCustom: "カスタム",
    noChanges: "変更なし",
    deactivateCustomStyles: "カスタムスタイルを解除",
    deactivate: "解除",
    passToEasy: "Easyモードに切替",
    activateNerd: "Nerdモードを有効化",
  },
  configurator: {
    hydrationLabel: "\u6C34\u5206\u91CF",
    hydrationTip:
      "\u5C0F\u9EA6\u7C89\u306B\u5BFE\u3059\u308B\u6C34\u306E\u5272\u5408\u3002\u9AD8\u3044\u307B\u3069\u67D4\u3089\u304B\u3044\u751F\u5730\u3068\u958B\u3044\u305F\u30AF\u30E9\u30E0\u306B\u306A\u308A\u307E\u3059\u304C\u3001\u6271\u3044\u304C\u96E3\u3057\u304F\u306A\u308A\u307E\u3059\u3002",
    flourWLabel: "\u5C0F\u9EA6\u7C89\u306E\u529B (W)",
    flourWLabelBlend: "\u5C0F\u9EA6\u7C89\u306E\u529B (W)",
    flourWTip:
      "\u5C0F\u9EA6\u7C89\u306E\u5438\u6C34\u529B\u3068\u30AC\u30B9\u4FDD\u6301\u529B\u3092\u793A\u3057\u307E\u3059\u3002W\u304C\u9AD8\u3044\u307B\u3069\u767A\u9175\u304C\u9577\u304F\u3001\u69CB\u9020\u304C\u5F37\u304F\u306A\u308A\u307E\u3059\u3002",
    plLabel: "P/L\u6BD4",
    plTip:
      "\u30A2\u30EB\u30D9\u30AA\u30B0\u30E9\u30D5\u306E\u7C98\u308A/\u4F38\u3073\u6BD4\u3002P/L\u304C\u4F4E\u3044=\u4F38\u3073\u308B\u751F\u5730\uFF08\u4E38\u3044\u30D4\u30B6\uFF09\u3002P/L\u304C\u9AD8\u3044=\u7C98\u308A\u306E\u3042\u308B\u751F\u5730\uFF08\u9577\u6642\u9593\u767A\u9175\uFF09\u3002W\u304B\u3089\u63A8\u5B9A\u53EF\u80FD\u3002",
    fermentLabel: "\u767A\u9175\u3068\u719F\u6210",
    fermentTip:
      "\u767A\u9175\u3068\u719F\u6210\u306E\u5408\u8A08\u6642\u9593\u3002\u767A\u9175\u306F\u751F\u5730\u3092\u81A8\u3089\u307E\u305B\u308B\u30AC\u30B9\u3092\u751F\u307F\u51FA\u3057\u3001\u719F\u6210\u306F\u30C7\u30F3\u30D7\u30F3\u3068\u30B0\u30EB\u30C6\u30F3\u3092\u5206\u89E3\u3057\u3066\u6D88\u5316\u6027\u3068\u9999\u308A\u3092\u9AD8\u3081\u307E\u3059\u3002\u4F4E\u6E29\u3067\u9577\u6642\u9593\u307B\u3069\u3001\u719F\u6210\u3078\u3068\u50BE\u304D\u307E\u3059\u3002",
    tempFridge: "{fridgeTemp} \u51B7\u8535\u5EAB",
    tempCool: "{coolTemp}",
    tempAmbient: "{ambientTemp} \u5BA4\u6E29",
    preFermentLabel: "\u4E88\u5099\u767A\u9175",
    preFermentTip:
      "\u4E88\u5099\u767A\u9175\uFF08\u30D3\u30AC\u3001\u30DD\u30FC\u30EA\u30C3\u30B7\u30E5\uFF09\u306F\u4E8B\u524D\u306B\u767A\u9175\u3055\u305B\u305F\u751F\u5730\u306E\u4E00\u90E8\u3067\u3059\u3002\u98A8\u5473\u3001\u6D88\u5316\u6027\u3001\u4FDD\u5B58\u6027\u304C\u5411\u4E0A\u3057\u307E\u3059\u304C\u300112\u301C24\u6642\u9593\u306E\u8FFD\u52A0\u8A08\u753B\u304C\u5FC5\u8981\u3067\u3059\u3002",
    ovenLabel: "\u30AA\u30FC\u30D6\u30F3",
    ovenTip:
      "\u30BF\u30A4\u30D7\u3092\u9078\u3073\u3001\u6E29\u5EA6\u3092\u8ABF\u6574\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u9AD8\u6E29\u307B\u3069\u7126\u304D\u304C\u65E9\u304F\u3001\u30AF\u30E9\u30B9\u30C8\u304C\u826F\u304F\u306A\u308A\u307E\u3059\u3002",
    panLabel: "\u5929\u677F",
    panTipRect:
      "\u5929\u677F\u306E\u5F62\u3068\u30B5\u30A4\u30BA\u306F\u751F\u5730\u306E\u91CF\u3068\u4ED5\u4E0A\u304C\u308A\u306B\u5F71\u97FF\u3057\u307E\u3059\u3002\u3053\u306E\u30B9\u30BF\u30A4\u30EB\u306E\u6A19\u6E96\u306F\u9577\u65B9\u5F62\u3067\u3059\u3002",
    panTipRound:
      "\u5929\u677F\u306E\u5F62\u3068\u30B5\u30A4\u30BA\u306F\u751F\u5730\u306E\u91CF\u3068\u4ED5\u4E0A\u304C\u308A\u306B\u5F71\u97FF\u3057\u307E\u3059\u3002\u3053\u306E\u30B9\u30BF\u30A4\u30EB\u306E\u6A19\u6E96\u306F\u4E38\u578B\u3067\u3059\u3002",
    panRectangular: "\u9577\u65B9\u5F62",
    panRound: "\u4E38\u578B",
    panLength: "\u9577\u3055",
    panWidth: "\u5E45",
    panDiameter: "\u76F4\u5F84",
    panArea: "\u5929\u677F\u9762\u7A4D",
    thicknessLabel: "\u539A\u3055",
    thicknessTip:
      "\u30D4\u30B6\u306E\u539A\u3055\u306F\u751F\u5730\u91CD\u91CF\u3001\u7126\u304D\u3001\u98DF\u611F\u306B\u76F4\u63A5\u5F71\u97FF\u3057\u307E\u3059\u3002\u4F4E\u3044\u5024=\u8584\u304F\u30D1\u30EA\u30D1\u30EA\u3002\u9AD8\u3044\u5024=\u3075\u3093\u308F\u308A\u539A\u3081\u3002",
    thicknessThin: "\u8584\u304F\u30D1\u30EA\u30D1\u30EA",
    thicknessThick: "\u3075\u3093\u308F\u308A\u539A\u3081",
    thicknessStandard:
      "\u3053\u306E\u30B9\u30BF\u30A4\u30EB\u306E\u6A19\u6E96",
    backLabel: "戻る",
    sliderOptimal: "最適",
    hintHighHydrationNeedsW: "加水率が {h}% の場合、強力粉が必要です：推奨 W ≥ {w}",
    hintLowWLimitsHydration: "W値が {w} の場合、推奨最大加水率は約 {h}% です",
    hintLongFermentUseFridge: "発酵時間が {hours}時間 の場合、生地のコントロールに冷蔵庫（{fridgeTemp}）を使用するのが最適です",
    hintShortFermentUseWarm: "発酵時間がわずか {hours}時間 の場合、酵母を活性化させるために室温（{ambientTemp}）で発酵させます",
    hintMediumFermentUseCool: "発酵時間が {hours}時間 の場合、コントロールと活性の理想的なバランスとして、涼しい場所（{coolTemp}）が最適です",
    hintHighHydrationNeedsTime: "加水率が {h}% の場合、推奨発酵時間は {hours}時間以上 です",
    hintLowPLForHighHydration: "高加水の場合、伸展性のために推奨 P/L ≤ {pl} です",
    hintHighWAllowsMoreHydration: "W値が {w} の場合、最大 {h}% の加水率まで対応可能です",
    hintAdaptiveLabel: "推奨値",
    hintLimitMinLabel: "最小限界",
    hintLimitMaxLabel: "最大限界",
  },
  cooking: {
    sectionsAria: "\u30EC\u30B7\u30D4\u30BB\u30AF\u30B7\u30E7\u30F3",
    tabRecipe: "\u30EC\u30B7\u30D4",
    tabRecipeTailored: "\u3042\u306A\u305F\u7528\u306E\u30EC\u30B7\u30D4",
    tabProcedure: "\u624B\u9806",
    toppingTitle: "\u30C8\u30C3\u30D4\u30F3\u30B0",
    chooseTopping: "\u30C8\u30C3\u30D4\u30F3\u30B0\u3092\u9078\u3076",
    learnMore: "\u8A73\u3057\u304F\u898B\u308B",
    tailoredEyebrow: "\u3042\u306A\u305F\u7528\u306B\u8ABF\u6574\u3057\u305F\u30EC\u30B7\u30D4",
    recipeEyebrow: "\u30EC\u30B7\u30D4",
    start: "\u30D4\u30B6\u4F5C\u308A\u3092\u958B\u59CB",
    resume: "\u30D4\u30B6\u4F5C\u308A\u3092\u518D\u958B",
    startShort: "\u958B\u59CB",
    inProgressShort: "\u9032\u884C\u4E2D",
    recipeAdapted: "\u8ABF\u6574\u6E08\u307F\u30EC\u30B7\u30D4",
    ovenSummary: "\u30AA\u30FC\u30D6\u30F3 {temp}",
    ovenOptimal: "\u30AA\u30FC\u30D6\u30F3\u6E29\u5EA6\u306F\u7406\u60F3\u7684",
    ovenLimited:
      "\u53EF\u80FD\u3067\u3059\u304C\u6E29\u5EA6\u306E\u4E0A\u9650\u306B\u8FD1\u3044\u3067\u3059",
    ovenNeedsAdaptation:
      "\u6E29\u5EA6\u306B\u5408\u308F\u305B\u305F\u8ABF\u6574\u304C\u5FC5\u8981",
    procedureHeroDescription:
      "{style}\u306E\u624B\u9806\uFF1A{steps}\u3001\u5408\u8A08{duration}\u3001{oven}\u3002",
    toppingNotesTitle: "\u30C8\u30C3\u30D4\u30F3\u30B0\u306E\u6CE8\u610F",
    toppingAmountsNote:
      "注意：材料の量は生地1個/単位あたりで調整されています。トッピングは下から上への重ねる順（生地の上の最初の層から表面の最後の層まで）で表示されています。",
    toppingPerUnit: "{unit}\u3042\u305F\u308A{amount}",
    durationLabel: "\u6240\u8981\u6642\u9593\uFF1A{duration}",
    comfortLabel: "\u4F59\u88D5\u3042\u308A {duration}",
    totalDuration: "\u5408\u8A08 {duration}",
    finalDoughStageTitle: "\u672C\u3054\u306D",
    rule55Title: "55\u306E\u6CD5\u5247",
    rule55AriaOpen: "55\u306E\u6CD5\u5247\u3068\u306F",
    rule55AriaClose: "55\u306E\u6CD5\u5247\u306E\u8AAC\u660E\u3092\u9589\u3058\u308B",
    rule55Description:
      "\u76EE\u5B89\uFF1A\u5BA4\u6E29 + \u5C0F\u9EA6\u7C89\u306E\u6E29\u5EA6 + \u6C34\u6E29 \u2248 55\u00B0C\u3067\u3001\u6700\u7D42\u751F\u5730\u6E29\u5EA6\u3092\u7D0425\u00B0C\u306B\u8FD1\u3065\u3051\u307E\u3059\u3002\u30DF\u30AD\u30B5\u30FC\u3092\u4F7F\u3046\u5834\u5408\u306F\u6469\u64E6\u71B1\u30671-3\u00B0C\u307B\u3069\u4E0A\u304C\u308A\u307E\u3059\u3002",
    stepDetailsShow: "\u624B\u9806\u3092\u898B\u308B",
    stepDetailsHide: "\u8A73\u7D30\u3092\u9589\u3058\u308B",
    learnInlineTitle: "\u8A73\u3057\u304F\uFF1A{label}",
    learnInlineBody:
      "{label}\uFF1A\u30EC\u30B7\u30D4\u3092\u96E2\u308C\u305A\u306B\u3053\u306E\u6982\u5FF5\u3092\u78BA\u8A8D\u3067\u304D\u307E\u3059\u3002\u3053\u306E\u5DE5\u7A0B\u306E\u5B9F\u8DF5\u7684\u306A\u8A73\u7D30\u306F\u4E0A\u306E\u30D6\u30ED\u30C3\u30AF\u306B\u3042\u308A\u3001\u7406\u8AD6\u5168\u4F53\u306F\u300C\u5B66\u3076\u300D\u306B\u3042\u308A\u307E\u3059\u3002",
    tipsCountOne: "{n}件のアドバイス",
    tipsCountMany: "{n}件のアドバイス",
    glossaryPreferment: "ビガと発酵種",
    glossaryBulk: "一次発酵（プンタータ）",
    glossaryProof: "二次発酵（アプレット）",
    glossaryBake: "メイラード反応",
    glossaryMix: "加水率",
    servingUnits: {
      panetto: { singular: "\u751F\u5730\u7389", plural: "\u751F\u5730\u7389" },
      teglia: { singular: "\u5929\u677F", plural: "\u5929\u677F" },
      pala: { singular: "\u30D1\u30FC\u30E9", plural: "\u30D1\u30FC\u30E9" },
      padellino: { singular: "\u30D1\u30F3\u30D4\u30B6", plural: "\u30D1\u30F3\u30D4\u30B6" },
      focaccia: { singular: "\u30D5\u30A9\u30AB\u30C3\u30C1\u30E3", plural: "\u30D5\u30A9\u30AB\u30C3\u30C1\u30E3" },
    },
  } as any,
  preFerment: PRE_FERMENT_JA as any,
  dietaryI18n: DIETARY_JA as any,
  troubleshootingI18n: TROUBLESHOOTING_JA as any,
  glossaryTerms: GLOSSARY_TERMS_JA as any,
};
