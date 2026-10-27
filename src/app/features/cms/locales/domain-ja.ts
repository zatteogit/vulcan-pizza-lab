/* === DOMAIN DATA i18n — 日本語 === */
import type {
  CmsPreFerment,
  CmsTroubleshootingI18n,
  CmsGlossaryTerms,
} from "../cms-context";

export const PRE_FERMENT_JA: Partial<CmsPreFerment> = {
  sectionLabel: "\u524D\u767A\u9175\u7A2E",
  tipsLabel: "\u30A2\u30C9\u30D0\u30A4\u30B9",
  showComparison:
    "\u30D3\u30AC vs \u30DD\u30FC\u30EA\u30C3\u30B7\u30E5 vs \u30AA\u30FC\u30C8\u30EA\u30FC\u30BA\u3092\u6BD4\u8F03",
  hideComparison: "\u6BD4\u8F03\u3092\u975E\u8868\u793A",
  paramHydration: "\u52A0\u6C34\u7387",
  paramDuration: "\u6642\u9593",
  paramTemperature: "\u6E29\u5EA6",
  paramYeast: "イースト",
  detailFermentation: "\u767A\u9175",
  detailFlavor: "\u98A8\u5473",
  detailCrust: "\u30AF\u30E9\u30B9\u30C8",
  detailExtensibility: "\u4F38\u5C55\u6027",
  detailIdealStyles:
    "\u7406\u60F3\u7684\u306A\u30B9\u30BF\u30A4\u30EB",
  compLabels: [
    "加水率",
    "イースト",
    "時間",
    "温度",
    "風味",
    "伸展性",
    "気泡",
    "複雑さ",
  ],
  items: {
    poolish: {
      origin: "\u30D5\u30E9\u30F3\u30B9",
      description:
        "液種：粉と水を同量、少量のイースト、20〜22 °Cで12〜16時間。",
      hydration: "100%（粉と水が同量）",
      consistency: "\u6DB2\u4F53\u3001\u6CE1\u7ACB\u3061",
      fermentationType:
        "速い：水分が多く数時間で熟成",
      flavor:
        "ほのかな酸味、ナッツの風味",
      crustResult:
        "\u8EFD\u3044\u3001\u6FC3\u3044\u91D1\u8272\u3001\u30EC\u30AA\u30D1\u30FC\u30C9\u30B9\u30DD\u30C3\u30C6\u30A3\u30F3\u30B0\u304C\u7279\u5FB4\u7684",
      extensibility:
        "\u9AD8\u3044 \u2014 \u4F38\u3070\u3057\u3084\u3059\u3044",
      idealStyles:
        "\u30C6\u30EA\u30A2\u30ED\u30DE\u30FC\u30CA\u3001NY\u30B9\u30BF\u30A4\u30EB\u3001\u73FE\u4EE3\u30CA\u30DD\u30EA\u3001\u30D5\u30A9\u30AB\u30C3\u30C1\u30E3",
      tips: [
        "表面が泡でいっぱいになり、中心がへこみ始めたら完成",
        "イーストが多いほど短時間：20〜22 °Cで0.1%なら15〜16時間、0.3%なら10〜12時間",
        "ポーリッシュの粉：全粉量の30〜50%",
      ],
    },
    biga: {
      origin: "\u30A4\u30BF\u30EA\u30A2",
      description:
        "硬い元種：粉、水44%、イースト1%、18〜20 °Cで約16時間。",
      hydration: "44%（全粒粉なら50%まで）",
      consistency:
        "\u4E7E\u71E5\u3001\u30B3\u30F3\u30D1\u30AF\u30C8",
      fermentationType:
        "ゆっくり：水分が少なく16〜48時間で熟成",
      flavor:
        "芳醇、花のような香り",
      crustResult:
        "\u30AB\u30EA\u30AB\u30EA\u3001\u3082\u308D\u3044\u3001\u7D30\u304B\u3044\u6C17\u6CE1",
      extensibility:
        "\u4F4E\u3044 \u2014 \u5206\u5272\u5F8C\u306E\u4F11\u606F\u304C\u5FC5\u8981",
      idealStyles:
        "ピンサ、ピッツァ・アル・タリオ、パーラ・ロマーナ、パン",
      tips: [
        "ところどころ膨らみ、ヨーグルトの香りがして軽く泡立てば完成。酸っぱければ発酵しすぎ",
        "ロングビガ：4〜5 °Cで24時間、その後18〜20 °Cで24時間",
        "ビガの粉：全粉量の20〜50%、通常は3分の1",
        "STGナポリピッツァには使わない：規定はストレート法のみ",
      ],
    },
    autolisi: {
      origin: "フランス（R. カルヴェル、1974年）",
      description:
        "元種ではない：イーストも塩も入れずに粉と水を休ませる工程。",
      hydration:
        "55-75%\uFF08\u30EC\u30B7\u30D4\u306E\u5168\u6C34\u5206\uFF09",
      consistency: "\u30DA\u30FC\u30B9\u30C8\u72B6",
      fermentationType:
        "\u306A\u3057\uFF08\u9175\u7D20\u6D3B\u6027\u306E\u307F\uFF09",
      flavor:
        "\u4E2D\u6027 \u2014 \u98A8\u5473\u3092\u5909\u3048\u306A\u3044",
      crustResult:
        "\u53EF\u5909 \u2014 \u5F8C\u7D9A\u30D7\u30ED\u30BB\u30B9\u306B\u4F9D\u5B58",
      extensibility:
        "\u9AD8\u3044 \u2014 \u7D79\u306E\u3088\u3046\u3067\u3079\u305F\u3064\u304D\u304C\u5C11\u306A\u3044",
      idealStyles:
        "\u5168\u30B9\u30BF\u30A4\u30EB\uFF08\u4E07\u80FD\u6280\u6CD5\uFF09",
      tips: [
        "20〜60分休ませ、イーストと塩はその後に加える",
        "ビガやポーリッシュと組み合わせられる",
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
      poolish: "0.1〜0.3%",
      autolisi: "0%",
    },
    duration: {
      biga: "16〜48時間",
      poolish: "12〜16時間",
      autolisi: "20〜60分",
    },
    temperature: {
      biga: "18〜20 °C",
      poolish: "20〜22 °C",
      autolisi: "\u5BA4\u6E29",
    },
    flavor: {
      biga: "芳醇",
      poolish: "ほのかな酸味",
      autolisi: "\u4E2D\u6027",
    },
    extensibility: {
      biga: "\u4F4E\u3044",
      poolish: "\u9AD8\u3044",
      autolisi: "\u9AD8\u3044",
    },
    alveolatura: {
      biga: "\u7D30\u304B\u3044",
      poolish: "\u5927\u304D\u3044",
      autolisi: "\u5927\u304D\u3044",
    },
    complexity: {
      biga: "\u4E2D",
      poolish: "\u4F4E",
      autolisi: "\u975E\u5E38\u306B\u4F4E",
    },
  },
};



export const TROUBLESHOOTING_JA: Partial<CmsTroubleshootingI18n> =
  {
    categories: {
      frying: "揚げ調理",
      dough: "\u751F\u5730",
      fermentation: "\u767A\u9175",
      shaping: "\u6210\u5F62",
      baking: "\u713C\u304D",
      solver: "\u30A2\u30EB\u30B4\u30EA\u30BA\u30E0",
      false_positive: "\u8AA4\u691C\u77E5",
    },
    issues: {
      FR01: {
        symptom: "外はきつね色でも中は生",
        cause: "油温が高すぎるか、生地が厚すぎます。",
        testRapido: "試しに揚げた一つを切り、中心を確認します。",
        fixImmediate: "次の分は火力を下げ、色だけで火の通りを判断しないでください。",
        prevention: "温度計を使い、レシピの油温を守ります。",
      },
      FR02: {
        symptom: "油っぽく、カリッとしない",
        cause: "油温が低いか、一度に入れすぎて温度が下がっています。",
        testRapido: "揚げる合間に油温を確認します。",
        fixImmediate: "油温がレシピの指定に戻るのを待ち、少量ずつ揚げて油をよく切ります。",
        prevention: "鍋に入れすぎず、調理中も油温を確認します。",
      },
      FR03: {
        symptom: "具が油の中に漏れる",
        cause: "縁の閉じ方が弱い、穴がある、または縁に具が付いています。",
        testRapido: "まだ揚げていない生地の閉じ目を確認します。",
        fixImmediate: "次の分はしっかり閉じ、熱い油に水を加えないでください。",
        prevention: "縁を清潔に保ち、具を入れすぎず、生地に穴を開けずに閉じます。",
      },

      P01: {
        symptom:
          "\u6301\u7D9A\u7684\u306B\u3079\u305F\u3064\u304F\u751F\u5730",
        cause:
          "\u52A0\u6C34\u7387\u304C\u5C0F\u9EA6\u7C89\u306E\u5438\u6C34\u80FD\u529B\u3092\u8D85\u3048\u3066\u3044\u308B",
        testRapido:
          "\u30EC\u30B7\u30D4\u306EH%\u3068\u5C0F\u9EA6\u7C89\u5438\u6C34\u7387\uFF08+5%\u6700\u5927\uFF09\u3092\u6BD4\u8F03",
        fixImmediate:
          "2-3%\u306E\u5C0F\u9EA6\u7C89\u3092\u52A0\u3048\u3001\u512A\u3057\u3044\u6298\u308A\u305F\u305F\u307F\u3067\u7D44\u307F\u8FBC\u3080",
        prevention:
          "H% \u2264 \u5C0F\u9EA6\u7C89\u5438\u6C34\u7387 + 5%\u3092\u4F7F\u7528",
      },
      P02: {
        symptom:
          "\u4F38\u3070\u3059\u3068\u751F\u5730\u304C\u7834\u308C\u308B",
        cause:
          "P/L\u304C\u9AD8\u3059\u304E\u308B\uFF08>0.8\uFF09\u307E\u305F\u306F\u767A\u9175\u4E0D\u8DB3\uFF08<6h\uFF09",
        testRapido:
          "\u751F\u5730\u738910cm\u4F38\u3070\u3059\uFF1A\u7834\u308C\u308B\uFF1F",
        fixImmediate:
          "\u5BA4\u6E29\u3067\u30AB\u30D0\u30FC\u3057\u306660\u5206\u4F11\u61A9",
        prevention:
          "P/L 0.5-0.6\u306E\u5C0F\u9EA6\u7C89\u3001\u6700\u4F4E8h\u767A\u9175",
      },
      P03: {
        symptom:
          "\u89E6\u308B\u3068\u751F\u5730\u304C\u5D29\u308C\u308B",
        cause:
          "\u904E\u767A\u9175\uFF08\u4F53\u7A4D>150%\u3001\u6307\u306E\u8DE1\u304C\u623B\u3089\u306A\u3044\uFF09",
        testRapido:
          "1cm\u6307\u3067\u62BC\u3059\uFF1A3-5\u79D2\u3067\u623B\u308B\uFF1F",
        fixImmediate:
          "\u4E0D\u53EF\u9006\u3002\u512A\u3057\u304F\u4F38\u3070\u3057\u3066\u3059\u3050\u713C\u304F",
        prevention:
          "6h\u3054\u3068\u306B\u4F53\u7A4D\u78BA\u8A8D\u3001\u6700\u5927+150%\u5897\u52A0",
      },
      P04: {
        symptom:
          "6\u6642\u9593\u4EE5\u4E0A\u7D4C\u3063\u3066\u3082\u81A8\u3089\u307E\u306A\u3044",
        cause:
          "\u30A4\u30FC\u30B9\u30C8\u304C\u6B7B\u3093\u3067\u3044\u308B\u3001\u6E29\u5EA6\u304C\u4F4E\u3059\u304E\u308B\u3001\u307E\u305F\u306F\u5869\u304C\u76F4\u63A5\u63A5\u89E6",
        testRapido:
          "\u6D3B\u6027\u30C6\u30B9\u30C8\uFF1A5g\u30A4\u30FC\u30B9\u30C8+5g\u7802\u7CD6\u309235\u00B0C\u306E100ml\u6C34\u306B \u2014 15\u5206\u5F8C\u306B\u6CE1\u7ACB\u3064\uFF1F",
        fixImmediate:
          "\u306C\u308B\u307E\u6E6F\u306B\u6EB6\u304B\u3057\u305F0.3%\u751F\u30A4\u30FC\u30B9\u30C8\u3092\u52A0\u3048\u3001\u6298\u308A\u305F\u305F\u307F\u3067\u7D44\u307F\u8FBC\u3080",
        prevention:
          "\u6BCE\u56DE\u4F7F\u7528\u524D\u306B\u30A4\u30FC\u30B9\u30C8\u3092\u30C6\u30B9\u30C8",
      },
      P05: {
        symptom:
          "\u767A\u9175\u304C\u901F\u3059\u304E\u308B\uFF083h\u672A\u6E80\u3067\u500D\u5897\uFF09",
        cause:
          "\u30A4\u30FC\u30B9\u30C8\u304C\u591A\u3059\u304E\u308B\uFF08>1.5%\uFF09\u307E\u305F\u306F\u5BA4\u6E29>28\u00B0C",
        testRapido:
          "3\u6642\u9593\u672A\u6E80\u3067\u500D\u5897\u3057\u305F\uFF1F",
        fixImmediate:
          "冷蔵で発酵を遅らせます。冷やしても直ちに止まるわけではありません。",
        prevention:
          "時間と温度に合わせて計算したイースト量を使う（18 °Cで24時間なら生イースト約0.1%）",
      },
      P06: {
        symptom:
          "\u9178\u3063\u3071\u3044/\u9175\u9178\u81ED\u304C\u5F37\u3044",
        cause:
          "\u30D8\u30C6\u30ED\u4E73\u9178\u83CCLAB\u304C>48h\u3001>18\u00B0C\u3067\u6D3B\u6027\uFF08\u7279\u306B\u5929\u7136\u9175\u6BCD\uFF09",
        testRapido:
          "\u751F\u5730pH \u2014 4.5-5.5\u304C\u6B63\u5E38\u3001<4.2\u306F\u554F\u984C",
        fixImmediate:
          "砂糖は味を隠しても過発酵を修正しません。使う前に生地を見直してください。",
        prevention:
          "製法に合わせて時間・温度・酵母を選び、生地を確認します。一律の時間基準はありません。",
      },
      P07: {
        symptom:
          "\u751F\u5730\u7389\u304C\u4F38\u3070\u3057\u305F\u5F8C\u306B\u7E2E\u3080\uFF08'\u30B4\u30E0\u52B9\u679C'\uFF09",
        cause:
          "\u30B0\u30EB\u30C6\u30F3\u304C\u5341\u5206\u306B\u7DE9\u548C\u3057\u3066\u3044\u306A\u3044",
        testRapido:
          "30cm\u306B\u4F38\u3070\u3059 \u2014 30\u79D2\u5F8C\u306B25cm\u306B\u623B\u308B\uFF1F",
        fixImmediate:
          "\u30AB\u30D0\u30FC\u3057\u3066\u8FFD\u52A015\u5206\u4F11\u61A9\u30012\u6BB5\u968E\u3067\u4F38\u3070\u3059",
        prevention:
          "\u4F38\u3070\u3059\u524D\u306B\u751F\u5730\u7389\u3092\u51B7\u8535\u5EAB\u304B\u308960-90\u5206\u51FA\u3059",
      },
      P08: {
        symptom:
          "\u30D4\u30C3\u30C4\u30A1\u306B\u5DE8\u5927\u306A\u4E0D\u898F\u5247\u306A\u7A74",
        cause:
          "\u30AC\u30B9\u629C\u304D\u4E0D\u8DB3 + \u4F38\u3070\u3057\u304C\u512A\u3057\u3059\u304E\u308B",
        testRapido:
          "\u6C17\u6CE1>3cm\u3067\u5206\u5E03\u304C\u4E0D\u5747\u4E00\uFF1F",
        fixImmediate:
          "\u4F38\u3070\u3059\u524D\u306B\u751F\u5730\u7389\u3092\u8EFD\u304F\u62BC\u3057\u3066\u30AC\u30B9\u3092\u518D\u5206\u914D",
        prevention:
          "\u767A\u9175\u6642\u9593\u309220%\u6E1B\u3089\u3059",
      },
      P09: {
        symptom:
          "\u751F\u5730\u304C\u751F\u3060\u304C\u7E01\u304C\u7126\u3052\u305F",
        cause:
          "\u71B1\u7684\u4E0D\u5747\u8861\uFF1A\u4E0A\u304B\u3089\u306E\u71B1\u304C\u591A\u304F\u3001\u4E0B\u304B\u3089\u306E\u71B1\u304C\u5C11\u306A\u3044",
        testRapido:
          "\u4E0A\u3068\u4E0B\u306E\u8272\u306E\u30B3\u30F3\u30C8\u30E9\u30B9\u30C8\u304C\u6975\u7AEF\uFF1F",
        fixImmediate:
          "\u30C8\u30C3\u30D4\u30F3\u30B0\u306A\u3057\u3067\u751F\u5730\u30923\u5206\u30D7\u30EC\u713C\u304D",
        prevention:
          "\u539A\u3044\u30C8\u30EC\u30A4/\u77F3\u3092\u4F7F\u7528\u3001\u4E0A\u4E0B\u306E\u71B1\u3092\u30D0\u30E9\u30F3\u30B9",
      },
      P10: {
        symptom:
          "\u30AF\u30E9\u30B9\u30C8\u304C\u9752\u767D\u3044\u3001\u8272\u304C\u3064\u304B\u306A\u3044",
        cause:
          "\u6E29\u5EA6<250\u00B0C\u3001\u7CD6\u304C\u6D88\u8017\u3001\u307E\u305F\u306F\u8868\u9762\u6C34\u5206\u904E\u591A",
        testRapido:
          "\u30AA\u30FC\u30D6\u30F3\u306F\u5C11\u306A\u304F\u3068\u3082250\u00B0C\u306B\u9054\u3059\u308B\uFF1F\u767A\u9175>48h\uFF1F",
        fixImmediate:
          "\u713C\u304F\u524D\u306B\u30AA\u30A4\u30EB+\u30CF\u30C1\u30DF\u30C4\u3092\u5857\u308B\u304B\u3001\u6700\u5F8C\u306B\u30B0\u30EA\u30EB2\u5206",
        prevention:
          "砂糖かモルトを0.5〜1%加え、よく予熱した石か鋼板を入れてオーブンを最高温度にする",
      },
      P11: {
        symptom:
          "\u30B4\u30E0\u306E\u3088\u3046\u306A\u30D4\u30C3\u30C4\u30A1\u3001\u30AB\u30EA\u30AB\u30EA\u3067\u306A\u3044",
        cause:
          "\u82AF\u6E29<85\u00B0C\u3001\u52A0\u6C34\u7387>70%\u3001\u307E\u305F\u306F\u713C\u304D\u304C\u9045\u3059\u304E\u308B",
        testRapido:
          "\u82AF\u6E29\u8A08\uFF1A90\u00B0C\u4EE5\u4E0A\u306B\u9054\u3059\u308B\uFF1F",
        fixImmediate:
          "\u713C\u304D\u6642\u9593+2\u5206\u307E\u305F\u306F\u6E29\u5EA6+20\u00B0C",
        prevention:
          "H \u2264 65%\u3001\u82AF\u6E29\u76EE\u6A1995\u00B0C",
      },
      P14: {
        symptom:
          "\u7E01\u306E\u30EC\u30AA\u30D1\u30FC\u30C9\u30B9\u30DD\u30C3\u30C8",
        cause:
          "\u30AA\u30FC\u30D6\u30F3\u5929\u4E95>500\u00B0C\u3068\u306E\u63A5\u89E6 \u2014 \u5C40\u6240\u7684\u30E1\u30A4\u30E9\u30FC\u30C9\u53CD\u5FDC",
        testRapido:
          "\u30B9\u30DD\u30C3\u30C8\u306F\u82E6\u3044\uFF1F",
        fixImmediate:
          "\u554F\u984C\u3067\u306F\u3042\u308A\u307E\u305B\u3093\uFF01\u30CA\u30DD\u30EA\u30D4\u30C3\u30C4\u30A1\u306E\u671B\u307E\u3057\u3044\u7279\u5FB4",
        prevention:
          "\u5F37\u3059\u304E\u308B\u5834\u5408\uFF1A\u713C\u304D\u4E2D20\u79D2\u3054\u3068\u306B\u30D4\u30C3\u30C4\u30A1\u3092\u56DE\u8EE2",
      },
      P15: {
        symptom:
          "\u30D4\u30C3\u30C4\u30A1\u306E\u88CF\u304C\u9ED2\u3044",
        cause:
          "\u77F3\u307E\u305F\u306F\u30C8\u30EC\u30A4\u304C\u71B1\u3059\u304E\u308B\uFF08>450\u00B0C\uFF09",
        testRapido: "\u5473\u898B\uFF1A\u82E6\u3044\uFF1F",
        fixImmediate:
          "\u82E6\u3044 = \u554F\u984C\uFF08\u6E29\u5EA6\u3092\u4E0B\u3052\u308B\uFF09\u3002\u7F8E\u5473\u3057\u3044 = \u6B63\u5E38",
        prevention:
          "\u77F3\u306E\u4E88\u71B1\u3092\u7BA1\u7406\u3001400\u00B0C\u3092\u8D85\u3048\u306A\u3044",
      },
      P16: {
        symptom: "\u7E01\u304C\u4F4E\u304F\u5E73\u3089",
        cause:
          "\u904E\u5EA6\u306E\u30AC\u30B9\u629C\u304D\u3001\u5C0F\u9EA6\u7C89W\u304C\u4F4E\u3059\u304E\u308B\u3001\u307E\u305F\u306F\u9EBA\u68D2\u4F7F\u7528",
        testRapido: "\u7E01\u306E\u9AD8\u3055<1cm\uFF1F",
        fixImmediate:
          "\u3088\u308A\u7E4A\u7D30\u306A\u4F38\u3070\u3057\u3001\u7E01\u3092\u62BC\u3055\u306A\u3044",
        prevention:
          "\u30CA\u30DD\u30EA\u306B\u306FW \u2265 240\u3001\u7E01\u306E\u3042\u308B\u30B9\u30BF\u30A4\u30EB\u306B\u306F\u7D76\u5BFE\u306B\u9EBA\u68D2\u3092\u4F7F\u308F\u306A\u3044",
      },
      P17: {
        symptom:
          "\u30D4\u30C3\u30C4\u30A1\u304C\u4E7E\u71E5\u3057\u3059\u304E\u308B",
        cause:
          "\u52A0\u6C34\u7387<55%\u307E\u305F\u306F\u713C\u304D\u6642\u9593\u304C\u9577\u3059\u304E\u308B\uFF08>10\u5206\uFF09",
        testRapido:
          "\u30EC\u30B7\u30D4\u306EH%\uFF1F\u5B9F\u969B\u306E\u713C\u304D\u6642\u9593\uFF1F",
        fixImmediate:
          "\u30C8\u30C3\u30D4\u30F3\u30B0\u306B\u305F\u3063\u3077\u308A\u30AA\u30A4\u30EB\u3092\u304B\u3051\u308B",
        prevention:
          "H \u2265 58%\u3001\u63A8\u5968\u713C\u304D\u6642\u9593\u3092\u8D85\u3048\u306A\u3044",
      },
      P18: {
        symptom:
          "\u30D4\u30C3\u30C4\u30A1\u306E\u4E2D\u592E\u304C\u6C34\u3063\u307D\u3044",
        cause:
          "\u30C8\u30C3\u30D4\u30F3\u30B0\u306E\u6C34\u5206\u304C\u591A\u3059\u304E\u308B\u307E\u305F\u306F\u713C\u304D\u304C\u77ED\u3059\u304E\u308B",
        testRapido:
          "\u30D4\u30C3\u30C4\u30A1\u3042\u305F\u308A\u306E\u30BD\u30FC\u30B9\u91CF\uFF1F\u30E2\u30C3\u30C4\u30A1\u30EC\u30E9\u304C\u975E\u5E38\u306B\u6E7F\u3063\u3066\u3044\u308B\uFF1F",
        fixImmediate:
          "\u751F\u5730\u30922\u5206\u30D7\u30EC\u713C\u304D\u3001\u305D\u306E\u5F8C\u30C8\u30C3\u30D4\u30F3\u30B0\u3092\u8F09\u305B\u308B",
        prevention:
          "30cm\u30D4\u30C3\u30C4\u30A1\u306B\u30BD\u30FC\u30B9\u6700\u594780ml\u3001\u30E2\u30C3\u30C4\u30A1\u30EC\u30E9\u3092\u3088\u304F\u6C34\u5207\u308A",
      },
      P19: {
        symptom:
          "\u751F\u5730\u7389\u304C\u4F38\u3070\u305B\u306A\u3044",
        cause:
          "\u7D14\u30DE\u30CB\u30C8\u30D0\u7C89\uFF08W >380\uFF09\u3001\u751F\u5730\u304C\u5F37\u3059\u304E\u308B",
        testRapido:
          "\u3069\u306E\u5C0F\u9EA6\u7C89\u3092\u4F7F\u3063\u305F\uFF1FW >350\uFF1F",
        fixImmediate:
          "\u6B21\u56DE\u306FW 200\u306E\u5C0F\u9EA6\u7C89\u309250:50\u3067\u30D6\u30EC\u30F3\u30C9",
        prevention:
          "\u30D4\u30C3\u30C4\u30A1\u306B\u306F\u6700\u5927W 320\u3001P/L 0.5-0.6\u306E\u5C0F\u9EA6\u7C89",
      },
      P20: {
        symptom:
          "\u751F\u5730\u304B\u3089'\u5316\u5B66\u7684'\u306A\u81ED\u3044",
        cause:
          "\u6C34\u9053\u6C34\u306E\u5869\u7D20\u304C\u9AD8\u3044",
        testRapido:
          "\u86C7\u53E3\u3092\u958B\u3051\u308B\u3068\u5F37\u3044\u81ED\u3044\u304C\u3059\u308B\uFF1F",
        fixImmediate:
          "\u6B21\u56DE\u306F\u30DC\u30C8\u30EB\u30A6\u30A9\u30FC\u30BF\u30FC\u3092\u4F7F\u7528",
        prevention:
          "\u6C34\u3092\u6FFE\u904E\u3059\u308B\u304B12\u6642\u9593\u958B\u3051\u305F\u307E\u307E\u7F6E\u304F\uFF08\u5869\u7D20\u304C\u84B8\u767A\uFF09",
      },
      P21: {
        symptom: "生地ごとに発酵がばらつく（家庭用冷蔵庫）",
        cause: "家庭用冷蔵庫は温度が安定しません。霜取り、扉の開閉、棚の位置の違いで低温熟成が揺らぎます。業務用の冷蔵室とは違います",
        testRapido: "同じスタイル、同じイースト量なのに、毎回の発酵の進み方が大きく違いますか？",
        fixImmediate: "生地をいちばん下か中段の棚（最も安定）に移し、時計だけでなく見た目で生地玉を判断してください",
        prevention: "使用する棚の温度と生地の変化を確認します。砂糖では冷蔵庫の温度変動を補正できません。",
      },
    },
    contextual: {
      sticky_dough: {
        message:
          "\u52A0\u6C34\u7387{h}%\u3067W{w}\uFF1A\u3079\u305F\u3064\u304F\u751F\u5730\u306E\u30EA\u30B9\u30AF",
        tip: "W \u2265 280\u306E\u5C0F\u9EA6\u7C89\u3092\u4F7F\u3046\u304B\u3001\u52A0\u6C34\u7387\u309268-70%\u306B\u4E0B\u3052\u308B",
      },
      high_pl: {
        message:
          "P/L {pl}\u304C\u9AD8\u3044\uFF1A\u751F\u5730\u304C\u5F37\u3059\u304E\u308B\u53EF\u80FD\u6027",
        tip: "\u5869\u3068\u30A4\u30FC\u30B9\u30C8\u3092\u52A0\u3048\u308B\u524D\u306B45\u5206\u306E\u30AA\u30FC\u30C8\u30EA\u30FC\u30BA\u3092\u8A08\u753B",
      },
      sour_risk: {
        message:
          "{h}h\u3001{t}\u00B0C\uFF1A\u9178\u5473\u306E\u30EA\u30B9\u30AF",
        tip: ">24h\u306E\u767A\u9175\u306B\u306F4-8\u00B0C\u306E\u6E29\u5EA6\u3092\u4F7F\u7528",
      },
      pale_crust: {
        message:
          "短い発酵です。次へ進む前に生地の状態を確認してください。",
        tip: "体積・弾力・押した時の戻りを確認してください。時間だけでは消化性を判断できません。",
      },
      cold_oven: {
        message:
          "\u30AA\u30FC\u30D6\u30F3{t}\u00B0C\uFF1A\u751F\u5730\u304C\u751F\u3067\u7E01\u304C\u7126\u3052\u308B\u30EA\u30B9\u30AF",
        tip: "\u30C8\u30C3\u30D4\u30F3\u30B0\u306A\u3057\u3067\u751F\u5730\u30923\u5206\u30D7\u30EC\u713C\u304D\u3001\u305D\u306E\u5F8C\u6750\u6599\u3092\u8F09\u305B\u308B",
      },
      beginner_hydration: {
        message:
          "\u52A0\u6C34\u7387{h}%\u306F\u521D\u5FC3\u8005\u306B\u306F\u96E3\u3057\u3044",
        tip: "60-65%\u304B\u3089\u59CB\u3081\u3001\u7D4C\u9A13\u3068\u3068\u3082\u306B\u5F90\u3005\u306B\u4E0A\u3052\u308B",
      },
      high_w: {
        message:
          "W{w}\u304C\u975E\u5E38\u306B\u9AD8\u3044\uFF1A\u751F\u5730\u304C\u4F38\u3070\u3057\u306B\u304F\u3044",
        tip: "W 200\u306E\u5C0F\u9EA6\u7C89\u309250:50\u3067\u6DF7\u305C\u308B\u304B\u3001\u9577\u3044\u30AA\u30FC\u30C8\u30EA\u30FC\u30BA\u3092\u8A08\u753B",
      },
      flat_long_ferment: {
        message:
          "{h}h\u51B7\u8535\u767A\u9175\u3067\u524D\u767A\u9175\u7A2E\u306A\u3057\uFF1A\u5473\u304C\u5E73\u5766\u306B\u306A\u308B\u53EF\u80FD\u6027",
        tip: "\u9999\u308A\u306E\u8907\u96D1\u3055\u306E\u305F\u3081\u306B\u524D\u767A\u9175\u7A2E\uFF08\u30DD\u30FC\u30EA\u30C3\u30B7\u30E5\u307E\u305F\u306F\u30D3\u30AC\uFF09\u3092\u52A0\u3048\u308B",
      },
    },
  };

export const GLOSSARY_TERMS_JA: Partial<CmsGlossaryTerms> = {
  terms: {
    w_alveograph: {
      name: "W\uFF08\u30B7\u30E7\u30D1\u30F3\u30FB\u30A2\u30EB\u30D9\u30AA\u30B0\u30E9\u30D5\uFF09",
      definition: "\u751F\u5730\u306E\u6C17\u6CE1\u3092\u7834\u88C2\u3059\u308B\u307E\u3067\u81A8\u3089\u307E\u305B\u308B\u306E\u306B\u5FC5\u8981\u306A\u7DCF\u30A8\u30CD\u30EB\u30AE\u30FC\u3002\u5C0F\u9EA6\u7C89\u306E\u7DCF\u5408\u7684\u306A\u5F37\u3055\u3092\u793A\u3057\u307E\u3059\u3002",
      whyImportant: "Wは小麦粉の総合的な強さを示します。粘り強さと伸びやすさはP・L・P/Lで評価します。Wが高いだけで生地が硬いとは限りません。",
      ranges: [
        { label: "\u5F31\u3044", value: "90\u2013160", note: "\u30D3\u30B9\u30B1\u30C3\u30C8\u3001\u30A6\u30A8\u30CF\u30FC\u30B9" },
        { label: "\u4E2D", value: "160\u2013200", note: "\u98DF\u30D1\u30F3\u3001\u30D5\u30A9\u30AB\u30C3\u30C1\u30E3" },
        { label: "\u4E2D\u301C\u5F37", value: "200\u2013280", note: "\u30CA\u30DD\u30EA\u30D4\u30C3\u30C4\u30A1" },
        { label: "\u5F37\u3044", value: "280\u2013350", note: "\u9577\u6642\u9593\u767A\u9175\u306E\u30D1\u30F3" },
        { label: "\u975E\u5E38\u306B\u5F37\u3044", value: "350\u2013450", note: "\u30D1\u30CD\u30C3\u30C8\u30FC\u30CD\u3001\u30AF\u30ED\u30EF\u30C3\u30B5\u30F3" },
      ],
    },
    p_tenacity: {
      name: "P\uFF08\u7C98\u308A\u5F37\u3055\uFF09",
      definition: "\u5909\u5F62\u306B\u5BFE\u3059\u308B\u6700\u5927\u306E\u62B5\u6297\u3002\u30A2\u30EB\u30D9\u30AA\u30B0\u30E9\u30D5\u66F2\u7DDA\u306E\u30D4\u30FC\u30AF\u3067\u3001\u751F\u5730\u304C\u5F15\u304D\u4F38\u3070\u3057\u306B\u3069\u308C\u3060\u3051\u62B5\u6297\u3059\u308B\u304B\u3092\u793A\u3057\u307E\u3059\u3002",
      whyImportant: "P\u304C\u9AD8\u3044\uFF1A\u300C\u786C\u3044\u300D\u751F\u5730\u3067\u3001\u713C\u6210\u4E2D\u3082\u5F62\u3092\u4FDD\u3061\u307E\u3059\u3002P\u304C\u4F4E\u3044\uFF1A\u300C\u67D4\u3089\u304B\u3044\u300D\u751F\u5730\u3067\u3001\u4F38\u3070\u3057\u3084\u3059\u3044\u53CD\u9762\u3001\u3078\u305F\u308B\u3053\u3068\u304C\u3042\u308A\u307E\u3059\u3002",
      ranges: [
        { label: "\u30D4\u30B6", value: "40\u201380 mm" },
        { label: "\u30D1\u30F3", value: "80\u2013120 mm" },
        { label: "\u30AF\u30ED\u30EF\u30C3\u30B5\u30F3", value: "100\u2013140 mm" },
      ],
    },
    l_extensibility: {
      name: "L\uFF08\u4F38\u5C55\u6027\uFF09",
      definition: "\u7834\u88C2\u3059\u308B\u307E\u3067\u306B\u6C17\u6CE1\u304C\u9054\u3059\u308B\u6700\u5927\u306E\u9577\u3055\u3002\u751F\u5730\u304C\u3069\u308C\u3060\u3051\u4F38\u3073\u308B\u304B\u3092\u793A\u3057\u307E\u3059\u3002",
      whyImportant: "L\u304C\u9AD8\u3044\uFF1A\u4F38\u3073\u3084\u3059\u3044\u751F\u5730\u3067\u3001\u7834\u308C\u305A\u306B\u697D\u306B\u4F38\u3070\u305B\u307E\u3059\u3002L\u304C\u4F4E\u3044\uFF1A\u4F38\u3073\u306B\u304F\u3044\u751F\u5730\u3067\u3001\u7834\u308C\u3084\u3059\u304F\u306A\u308A\u307E\u3059\u3002",
      ranges: [
        { label: "\u30D4\u30B6", value: "80\u2013120 mm" },
        { label: "\u30D1\u30F3", value: "60\u2013100 mm" },
      ],
    },
    pl_ratio: {
      name: "P/L\uFF08\u7C98\u308A\u5F37\u3055/\u4F38\u5C55\u6027\u306E\u6BD4\uFF09",
      definition: "生地が変形に抵抗する力と、伸びる性質の比率です。",
      whyImportant: "生地の粘弾性のバランスを表します。適切な値は粉・加水率・製法で変わり、ピザの高さや食感を保証しません。",
      ranges: [
        { label: "<0.4 \u975E\u5E38\u306B\u4F38\u3073\u3084\u3059\u3044", value: "\u3064\u3076\u308C\u3084\u3059\u3044", note: "\u30D4\u30F3\u30B5" },
        { label: "0.4\u20130.5 \u4F38\u3073\u3084\u3059\u3044", value: "\u6271\u3044\u3084\u3059\u3044", note: "\u30AF\u30E9\u30B7\u30C3\u30AF\u306A\u30CA\u30DD\u30EA\u30D4\u30C3\u30C4\u30A1" },
        { label: "0.5\u20130.7 \u30D0\u30E9\u30F3\u30B9\u578B", value: "\u30D0\u30E9\u30F3\u30B9\u304C\u826F\u3044", note: "\u73FE\u4EE3\u306E\u30CA\u30DD\u30EA\u30D4\u30C3\u30C4\u30A1\u3001\u30D1\u30F3" },
        { label: "0.7\u20131.0 \u7C98\u308A\u304C\u5F37\u3044", value: "\u30B3\u30B7\u304C\u5F37\u3044", note: "\u9577\u6642\u9593\u767A\u9175\u306E\u30D1\u30F3" },
        { label: ">1.0 \u975E\u5E38\u306B\u7C98\u308A\u304C\u5F37\u3044", value: "\u5F3E\u529B\u304C\u3042\u308A\u3001\u7E2E\u3080", note: "\u30AF\u30ED\u30EF\u30C3\u30B5\u30F3" },
      ],
    },
    falling_number: {
      name: "\u30D5\u30A9\u30FC\u30EA\u30F3\u30B0\u30CA\u30F3\u30D0\u30FC\uFF08Hagberg-Perten\uFF09",
      definition: "\u52A0\u71B1\u3057\u305F\u5C0F\u9EA6\u7C89\u306E\u61F8\u6FC1\u6DB2\u306E\u4E2D\u3092\u64B9\u62CC\u68D2\u304C\u843D\u4E0B\u3059\u308B\u306E\u306B\u304B\u304B\u308B\u6642\u9593\u3002\u30A2\u30DF\u30E9\u30FC\u30BC\u6D3B\u6027\u3092\u793A\u3057\u307E\u3059\u3002",
      whyImportant: "FN\u304C\u4F4E\u3044\uFF08<250\uFF09\uFF1A\u767A\u9175\u306F\u901F\u3044\u304C\u751F\u5730\u304C\u4E0D\u5B89\u5B9A\u3002FN\u304C\u9AD8\u3044\uFF08>300\uFF09\uFF1A\u9577\u6642\u9593\u719F\u6210\u3067\u3082\u5B89\u5B9A\u3057\u307E\u3059\u3002",
      ranges: [
        { label: "<200 \u30A2\u30DF\u30E9\u30FC\u30BC\u304C\u975E\u5E38\u306B\u591A\u3044", value: "\u751F\u5730\u304C\u3079\u305F\u3064\u304F", note: "\u30D4\u30B6\u306B\u306F\u4E0D\u5411\u304D" },
        { label: "200\u2013250 \u591A\u3044", value: "\u3057\u3063\u3068\u308A\u3057\u305F\u30AF\u30E9\u30E0", note: "\u77ED\u6642\u9593\u767A\u9175\u306E\u30D1\u30F3" },
        { label: "250\u2013300 \u4E2D\u7A0B\u5EA6", value: "\u30D0\u30E9\u30F3\u30B9\u304C\u826F\u3044", note: "\u30D4\u30B6 8-12h" },
        { label: "300\u2013400 \u5C11\u306A\u3044", value: "\u4E7E\u304D\u6C17\u5473\u3001\u767A\u9175\u304C\u9045\u3044", note: "\u30D4\u30B6 24-48h" },
        { label: ">400 \u975E\u5E38\u306B\u5C11\u306A\u3044", value: "\u4E7E\u71E5", note: "\u4E7E\u71E5\u30D1\u30B9\u30BF" },
      ],
    },
    hydration: {
      name: "\u52A0\u6C34\u7387\uFF08H%\uFF09",
      definition: "\u751F\u5730\u4E2D\u306E\u5C0F\u9EA6\u7C89\u306B\u5BFE\u3059\u308B\u6C34\u306E\u91CD\u91CF\u306E\u5272\u5408\uFF08%\uFF09\u3002",
      whyImportant: "H\u304C\u4F4E\u3044\uFF08<55%\uFF09\uFF1A\u30AB\u30EA\u30C3\u3068\u3057\u3066\u6271\u3044\u3084\u3059\u3044\u3002H\u304C\u4E2D\u7A0B\u5EA6\uFF0860-65%\uFF09\uFF1A\u30D0\u30E9\u30F3\u30B9\u578B\u3002H\u304C\u9AD8\u3044\uFF08>70%\uFF09\uFF1A\u5F37\u3044\u5C0F\u9EA6\u7C89\uFF08W>280\uFF09\u3068\u6280\u8853\u304C\u5FC5\u8981\u3067\u3059\u3002",
      ranges: [
        { label: "\u30AF\u30E9\u30B7\u30C3\u30AF\u306A\u30CA\u30DD\u30EA\u30D4\u30C3\u30C4\u30A1", value: "55\u201360%", note: "\u67D4\u3089\u304B\u304F\u6271\u3044\u3084\u3059\u3044" },
        { label: "\u73FE\u4EE3\u306E\u30CA\u30DD\u30EA\u30D4\u30C3\u30C4\u30A1", value: "60\u201365%", note: "\u8EFD\u3044\u30B3\u30EB\u30CB\u30C1\u30E7\u30FC\u30CD" },
        { label: "\u30AB\u30CC\u30C3\u30C8", value: "65\u201370%", note: "\u5927\u304D\u306A\u6C17\u6CE1" },
        { label: "\u30D4\u30F3\u30B5\u30FB\u30ED\u30DE\u30FC\u30CA", value: "75\u201385%", note: "\u5929\u677F\u306B\u5E83\u3052\u308B" },
        { label: "\u30D5\u30A9\u30AB\u30C3\u30C1\u30E3/\u30DC\u30F3\u30C1", value: "85\u2013100%+", note: "\u30D0\u30C3\u30BF\u30FC\u72B6" },
      ],
    },
    absorption: {
      name: "\u5438\u6C34\u7387",
      definition: "\u5C0F\u9EA6\u7C89\u304C\u6271\u3044\u3084\u3059\u3044\u72B6\u614B\u3092\u4FDD\u3063\u305F\u307E\u307E\u5438\u53CE\u3067\u304D\u308B\u6C34\u306E\u6700\u5927\u91CF\u3002\u30BF\u30F3\u30D1\u30AF\u8CEA\u3001\u640D\u50B7\u30C7\u30F3\u30D7\u30F3\u3001\u98DF\u7269\u7E4A\u7DAD\u306B\u3088\u3063\u3066\u5909\u308F\u308A\u307E\u3059\u3002",
      ranges: [
        { label: "\u30BF\u30A4\u30D700\u30FB\u5F31\uFF08W150\uFF09", value: "50\u201352%" },
        { label: "\u30BF\u30A4\u30D700\u30FB\u4E2D\uFF08W220\uFF09", value: "53\u201355%" },
        { label: "\u30BF\u30A4\u30D700\u30FB\u5F37\uFF08W280\uFF09", value: "56\u201358%" },
        { label: "\u5168\u7C92\u7C89", value: "65\u201375%" },
        { label: "\u30DE\u30CB\u30C8\u30D0\uFF08W380\uFF09", value: "60\u201365%" },
      ],
    },
    stability: {
      name: "\u751F\u5730\u306E\u5B89\u5B9A\u5EA6",
      definition: "捏ねている間、生地が一定の状態を保つ時間です。ファリノグラフで測定します。",
      whyImportant: "\u5B89\u5B9A\u5EA6\u304C\u4F4E\u3044\uFF08<5 min\uFF09\uFF1A\u3053\u306D\u3059\u304E\u308B\u3068\u52A3\u5316\u3057\u307E\u3059\u3002\u9AD8\u3044\uFF08>10 min\uFF09\uFF1A\u4F5C\u696D\u30DF\u30B9\u306B\u5F37\u304F\u306A\u308A\u307E\u3059\u3002",
      ranges: [
        { label: "\u5F31\u3044", value: "2\u20134 min" },
        { label: "\u4E2D", value: "5\u20138 min" },
        { label: "\u5F37\u3044", value: "10\u201315 min" },
        { label: "\u30DE\u30CB\u30C8\u30D0", value: "15\u201320 min" },
      ],
    },
    yeast: {
      name: "\u30A4\u30FC\u30B9\u30C8\uFF08Saccharomyces cerevisiae\uFF09",
      definition: "糖を発酵させ、二酸化炭素、アルコール、香りの成分を作る単細胞の菌類です。",
      whyImportant: "活性は菌株・量・温度・生地によって変わります。低温で発酵は遅くなりますが、一律に直ちに止まる温度はありません。",
      ranges: [
        { label: "\u751F\u30A4\u30FC\u30B9\u30C8", value: "0.5\u20132.0%", note: "\u6C34\u520670%\u3001\u51B7\u85354\u00B0C" },
        { label: "\u30A2\u30AF\u30C6\u30A3\u30D6\u30C9\u30E9\u30A4\u30A4\u30FC\u30B9\u30C8", value: "0.3\u20131.0%", note: "\u5148\u306B\u6C34\u3067\u623B\u3059" },
        { label: "\u30A4\u30F3\u30B9\u30BF\u30F3\u30C8\u30C9\u30E9\u30A4\u30A4\u30FC\u30B9\u30C8", value: "0.2\u20130.8%", note: "\u305D\u306E\u307E\u307E\u6DF7\u305C\u308B" },
      ],
    },
    lab: {
      name: "LAB\uFF08\u4E73\u9178\u83CC\uFF09",
      definition: "\u7CD6\u3092\u767A\u9175\u3055\u305B\u3066\u4E73\u9178\uFF08\u304A\u3088\u3073\u9162\u9178\uFF09\u3092\u751F\u6210\u3059\u308B\u7D30\u83CC\u3002\u5929\u7136\u9175\u6BCD\u306B\u542B\u307E\u308C\u307E\u3059\u3002",
      whyImportant: "菌株・粉・製法により酸度やフルクタンが変わります。乳酸菌がいても低FODMAP対応の証明にはなりません。",
    },
    q10: {
      name: "Q\u2081\u2080\uFF08\u6E29\u5EA6\u4FC2\u6570\uFF09",
      definition: "\u6E29\u5EA6\u304C10\u00B0C\u4E0A\u304C\u308B\u3054\u3068\u306B\u3001\u751F\u5316\u5B66\u53CD\u5FDC\u306E\u901F\u5EA6\u304C\u4F55\u500D\u306B\u306A\u308B\u304B\u3092\u793A\u3059\u4FC2\u6570\u3002",
      whyImportant: "Q\u2081\u2080 = 2\u306A\u3089\u3001\u767A\u9175\u306E\u901F\u3055\u306F+10\u00B0C\u3054\u3068\u306B2\u500D\u306B\u306A\u308A\u307E\u3059\uFF1A18\u00B0C\u306724h \u2248 28\u00B0C\u306712h\u3002\u4EE5\u4E0B\u306E\u5024\u306F{brand}\u306E\u30E2\u30C7\u30EB\u306B\u3088\u308B\u63A8\u5B9A\u5024\u3067\u3059\u3002",
      ranges: [
        { label: "\u5E02\u8CA9\u30A4\u30FC\u30B9\u30C8 \u226510\u00B0C", value: "2.0", note: "\u30E2\u30C7\u30EB\u306B\u3088\u308B\u63A8\u5B9A\u300218\u301C25 \u00B0C\u306E\u5897\u6B96\u30C7\u30FC\u30BF\u3068\u6574\u5408" },
        { label: "\u5E02\u8CA9\u30A4\u30FC\u30B9\u30C8 <10\u00B0C", value: "1.6", note: "\u30E2\u30C7\u30EB\u306B\u3088\u308B\u63A8\u5B9A\uFF08\u51FA\u5178\u306A\u3057\uFF09" },
        { label: "\u5929\u7136\u9175\u6BCD >15\u00B0C", value: "2.2", note: "\u30E2\u30C7\u30EB\u306B\u3088\u308B\u63A8\u5B9A" },
        { label: "\u5929\u7136\u9175\u6BCD \u226415\u00B0C", value: "1.9", note: "\u30E2\u30C7\u30EB\u306B\u3088\u308B\u63A8\u5B9A" },
      ],
    },
    arrhenius: {
      name: "\u30A2\u30EC\u30CB\u30A6\u30B9\u306E\u5F0F",
      definition: "\u53CD\u5FDC\u901F\u5EA6\u304C\u7D76\u5BFE\u6E29\u5EA6\u306B\u3069\u3046\u4F9D\u5B58\u3059\u308B\u304B\u3092\u8868\u3059\u5F0F\u3002",
      whyImportant: "\u03B2=0.075\u3001T_ref=18\u00B0C\u306E\u3068\u304D \u2192 Q\u2081\u2080 \u2248 2.12\u3002{brand}\u306E\u30A8\u30F3\u30B8\u30F3\u3067\u3001\u30A4\u30FC\u30B9\u30C8\u91CF\u3068\u6642\u9593\u306E\u8A08\u7B97\u306B\u4F7F\u308F\u308C\u3066\u3044\u307E\u3059\u3002",
    },
    biga: {
      name: "\u30D3\u30AC",
      definition: "粉、水44%（全粒粉なら50%まで）、イースト1%で作る硬い元種。18〜20 °Cで約16時間熟成。ロングビガは4〜5 °Cで24時間、さらに18〜20 °Cで24時間。",
      whyImportant: "本生地に香りと骨格を与える。通常は全粉量の3分の1（20〜50%）。STGナポリピッツァはストレート法のため使えない。",
    },
    poolish: {
      name: "\u30DD\u30FC\u30EA\u30C3\u30B7\u30E5",
      definition: "粉と水を同量、少量のイーストで作る液種。20〜22 °Cで12〜16時間熟成（イースト0.1%で15〜16時間、0.3%で10〜12時間）。",
      whyImportant: "早く熟成し、生地を伸ばしやすくする。通常は全粉量の30〜50%。表面が泡でいっぱいになり中心がへこみ始めたら完成。",
    },
    autolysis: {
      name: "\u30AA\u30FC\u30C8\u30EA\u30FC\u30BA",
      definition: "イーストも塩も入れずに粉と水を20〜60分休ませる工程（R. カルヴェル、1974年）。元種ではない。",
      whyImportant: "生地が伸びやすく、扱いやすくなる。",
    },
    bulk_fermentation: {
      name: "\u4E00\u6B21\u767A\u9175\uFF08\u30D7\u30F3\u30BF\u30FC\u30BF\uFF09",
      definition: "こね上げ後、分割前に生地をひとまとめで発酵させる一次発酵。スタイルにより1時間未満から冷蔵で1日以上まで。適切な時間は手順に従う。",
      whyImportant: "グルテンが緩み、発酵が始まり、生地に香りがつく。",
    },
    ball_fermentation: {
      name: "\u4E8C\u6B21\u767A\u9175\uFF08\u30A2\u30D7\u30EC\u30C3\u30C8\uFF09",
      definition: "分割後の二次発酵。生地玉で、天板スタイルなら天板の中で行う。時間はスタイル・温度・イーストによる。適切な時間は手順に従う。",
      whyImportant: "伸ばして焼くのにちょうどよい大きさまで生地を膨らませる。",
    },
    maillard: {
      name: "\u30E1\u30A4\u30E9\u30FC\u30C9\u53CD\u5FDC",
      definition: "加熱によって進みやすくなる、アミノ化合物と還元糖の非酵素的反応の総称です。",
      whyImportant: "クラストの色と香りに関わります。進み方は表面温度・時間・水分・材料で変わり、オーブンの温度と食品の温度は同じではありません。",
    },
    caramelization: {
      name: "\u30AB\u30E9\u30E1\u30EB\u5316",
      definition: "加熱中に起こる糖の変化です。メイラード反応とは異なり、アミノ化合物を必要としません。",
      whyImportant: "色や焼き香に関わることがあります。糖の種類・水分・時間・表面温度によって効果が変わります。",
    },
    starch_gelatinization: {
      name: "\u30C7\u30F3\u30D7\u30F3\u306E\u7CCA\u5316",
      definition: "水と熱によってデンプン粒が吸水・膨潤し、結晶構造の一部を失います。起こる温度帯はデンプンの種類や配合で変わります。",
      whyImportant: "クラムの構造やデンプンの変化に関わります。中心温度一つだけで、完全な焼き上がりや個人の消化性を保証することはできません。",
    },
    retrogradation: {
      name: "\u30C7\u30F3\u30D7\u30F3\u306E\u8001\u5316",
      definition: "\u4FDD\u5B58\u4E2D\u306B\u7CCA\u5316\u3057\u305F\u30C7\u30F3\u30D7\u30F3\u304C\u518D\u7D50\u6676\u5316\u3059\u308B\u3053\u3068\u30024\u00B0C\uFF08\u51B7\u8535\u5EAB\uFF09\u3067\u6700\u5927\u306B\u306A\u308A\u307E\u3059\u3002",
      whyImportant: "\u30AF\u30E9\u30E0\u304C\u786C\u304F\u306A\u308A\u300C\u30D1\u30B5\u3064\u304D\u300D\u307E\u3059\u3002\u9045\u3089\u305B\u308B\u65B9\u6CD5\uFF1A\u6CB9\u81022-3%\u3001\u7CD61-2%\u3001\u9577\u6642\u9593\u767A\u9175\u3001\u9AD8\u52A0\u6C34\u3002",
    },
    thermal_conductivity: {
      name: "\u71B1\u4F1D\u5C0E\u7387",
      definition: "\u6750\u6599\u304C\u71B1\u3092\u4F1D\u3048\u308B\u80FD\u529B\u3002",
      whyImportant: "\u30B9\u30C1\u30FC\u30EB\uFF08k=50\uFF09\uFF1A\u5BB6\u5EAD\u7528\u30AA\u30FC\u30D6\u30F3280\u00B0C\u306B\u6700\u9069\u3001\u713C\u62106-8 min\u3002\u30B9\u30C8\u30FC\u30F3\uFF08k=2\uFF09\uFF1A\u85AA\u7AAF450\u00B0C+\u306B\u6700\u9069\u3001\u713C\u621060-90s\u3002",
      ranges: [
        { label: "\u9285", value: "400" },
        { label: "\u30A2\u30EB\u30DF\u30CB\u30A6\u30E0", value: "205" },
        { label: "\u70AD\u7D20\u92FC", value: "50" },
        { label: "\u30B9\u30C6\u30F3\u30EC\u30B9\u92FC", value: "16" },
        { label: "\u30B3\u30FC\u30C7\u30A3\u30A8\u30E9\u30A4\u30C8\uFF08\u30B9\u30C8\u30FC\u30F3\uFF09", value: "2.5\u20133.5" },
        { label: "\u8010\u706B\u77F3", value: "1.0\u20131.5" },
        { label: "\u30D4\u30B6\u751F\u5730", value: "0.5" },
      ],
    },
    fodmap: {
      name: "FODMAP",
      definition: "Fermentable Oligosaccharides, Disaccharides, Monosaccharides And Polyols\u3002\u767A\u9175\u3057\u3084\u3059\u3044\u77ED\u9396\u70AD\u6C34\u5316\u7269\uFF08\u5C0F\u9EA6\u306B\u306F\u30D5\u30EB\u30AF\u30BF\u30F3\u304C1-3%\uFF09\u3002",
      whyImportant: "発酵でFODMAP量が変わることはありますが、粉、微生物、製法、一食分の量によって異なります。時間だけで削減率や低FODMAPへの適合を判定することはできません。",
    },
    histamine: {
      name: "\u30D2\u30B9\u30BF\u30DF\u30F3",
      definition: "\u30D2\u30B9\u30C1\u30B8\u30F3\u306E\u8131\u70AD\u9178\u306B\u3088\u3063\u3066\u751F\u3058\u308B\u751F\u4F53\u30A2\u30DF\u30F3\u3002\u767A\u9175\u4E2D\u306BLAB\u304C\u751F\u6210\u3057\u3001\u719F\u6210\u30C1\u30FC\u30BA\u3084\u52A0\u5DE5\u8089\u306B\u3082\u542B\u307E\u308C\u307E\u3059\u3002",
      whyImportant: "含有量は微生物、材料、製法、保存方法に左右されます。一定の時間当たり増加率では計算できず、短時間発酵でも不含有は保証されません。",
    },
    gluten: {
      name: "\u30B0\u30EB\u30C6\u30F3",
      definition: "グリアジンとグルテニンが、水と捏ねる操作によって、生地に弾力と伸びのある網目を作ります。",
      whyImportant: "\u5F3E\u6027\u306F\u30B0\u30EB\u30C6\u30CB\u30F3\uFF08S-S\u7D50\u5408\uFF09\u3001\u7C98\u6027\u306F\u30B0\u30EA\u30A2\u30B8\u30F3\uFF08H\u7D50\u5408\uFF09\u306B\u3088\u308B\u3082\u306E\u3067\u3059\u3002\u9577\u6642\u9593\u306E\u30BF\u30F3\u30D1\u30AF\u8CEA\u5206\u89E3\u3067\u7D50\u5408\u304C\u5207\u308C \u2192 \u751F\u5730\u304C\u3088\u308A\u4F38\u3073\u3084\u3059\u304F\u306A\u308A\u307E\u3059\u3002",
    },
    proteolysis: {
      name: "\u30BF\u30F3\u30D1\u30AF\u8CEA\u5206\u89E3",
      definition: "プロテアーゼという酵素が、生地のタンパク質をペプチドやアミノ酸などの小さな分子に分解します。",
      whyImportant: "生地の伸びや強度が変化します。粉・微生物・温度・製法によって異なり、すべてに共通する最適時間はありません。個人の消化性を測るものではありません。",
    },
    thickness_factor: {
      name: "Thickness Factor\uFF08TF\u30FB\u539A\u3055\u4FC2\u6570\uFF09",
      definition: "ピザの面積あたりの生地量です。1cm²あたりに使う生地のグラム数を表します。",
      whyImportant: "\u713C\u6210\u6642\u9593\u3001\u30AB\u30EA\u30C3\u3068\u611F\u3001\u30AB\u30ED\u30EA\u30FC\u5BC6\u5EA6\u3092\u5DE6\u53F3\u3057\u307E\u3059\u3002{brand}\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u72EC\u81EA\u306E\u6307\u6A19\u3067\u3059\u3002",
      ranges: [
        { label: "\u30CA\u30DD\u30EA\u30D4\u30C3\u30C4\u30A1", value: "0.30\u20130.36", note: "6-7 mm" },
        { label: "\u30ED\u30FC\u30DE\u98A8\uFF08\u4E38\u578B\uFF09", value: "0.20\u20130.25", note: "4-5 mm" },
        { label: "\u30CB\u30E5\u30FC\u30E8\u30FC\u30AF", value: "0.40\u20130.50", note: "8-10 mm" },
        { label: "\u30B7\u30AB\u30B4\u30FB\u30C7\u30A3\u30FC\u30D7\u30C7\u30A3\u30C3\u30B7\u30E5", value: "1.00\u20131.30", note: "20-26 mm" },
      ],
    },
    friction_factor: {
      name: "\u30DF\u30AD\u30B5\u30FC\u306E\u6469\u64E6\u71B1",
      definition: "\u30DF\u30AD\u30B5\u30FC\u304C\u3053\u306D\u308B\u9593\u306B\u751F\u5730\u306B\u52A0\u308F\u308B\u6E29\u5EA6\u3002",
      whyImportant: "\u3053\u306D\u308B\u3068\u751F\u5730\u304C\u6E29\u307E\u308A\u3001\u767A\u9175\u304C\u65E9\u304F\u59CB\u307E\u308A\u307E\u3059\u3002\u6A5F\u68B0\u3092\u4F7F\u3046\u3068\u304D\u306F\u6C34\u3092\u51B7\u305F\u304F\u3059\u308B\u306E\u306F\u305D\u306E\u305F\u3081\u3067\u3059\u3002",
      ranges: [
        { label: "\u624B\u3054\u306D", value: "0" },
        { label: "\u30D5\u30A9\u30FC\u30AF\u30DF\u30AD\u30B5\u30FC", value: "2" },
        { label: "\u30B9\u30D1\u30A4\u30E9\u30EB\u30DF\u30AD\u30B5\u30FC", value: "3" },
        { label: "\u5BB6\u5EAD\u7528\u30B9\u30BF\u30F3\u30C9\u30DF\u30AD\u30B5\u30FC\uFF08\u5BB6\u5EAD\u306E\u751F\u5730\uFF09", value: "4" },
        { label: "\u30B9\u30BF\u30F3\u30C9\u30DF\u30AD\u30B5\u30FC", value: "5" },
      ],
    },
    rule_of_55: {
      name: "\u6C34\u306E\u6E29\u5EA6\uFF083\u3064\u306E\u6E29\u5EA6\uFF09",
      definition: "\u751F\u5730\u304C\u76EE\u6A19\u306E\u6E29\u5EA6\u306B\u306A\u308B\u3088\u3046\u3001\u6C34\u3092\u4F55\u5EA6\u306B\u3059\u308C\u3070\u3088\u3044\u304B\u3092\u8A08\u7B97\u3057\u307E\u3059\u3002",
      whyImportant: "3\u3064\u306E\u6E29\u5EA6\u306E\u5408\u8A08 = 3 \u00D7 \u76EE\u6A19\u751F\u5730\u6E29\u5EA6 \u2212 \u6469\u64E6\u71B1\u3002\u30D4\u30C3\u30C4\u30A7\u30EA\u30A2\u3067\u306F\u300C55\u306E\u6CD5\u5247\u300D\u3068\u3082\u547C\u3073\u307E\u3059\u3002\u5408\u8A08\u309255\u306B\u56FA\u5B9A\u3059\u308B\u3068\u751F\u5730\u306F\u7D0418 \u00B0C\uFF0855 \u00F7 3\uFF09\u3002\u3053\u3053\u3067\u306F\u30B9\u30BF\u30A4\u30EB\u306E\u76EE\u6A19\u6E29\u5EA622\u301C24 \u00B0C\u3092\u4F7F\u3044\u307E\u3059\u3002",
    },
    a_score: {
      name: "A-Score\uFF08\u6B63\u7D71\u6027\uFF09",
      definition: "元のスタイルへの近さを0〜100点で示します。規定への適合を認証するものではありません。",
      ranges: [
        { label: "90-100", value: "\u53B3\u5BC6\u306B\u672C\u683C\u7684" },
        { label: "75-89", value: "\u307B\u307C\u672C\u683C\u7684" },
        { label: "60-74", value: "\u30B9\u30BF\u30A4\u30EB\u306B\u7740\u60F3\u3092\u5F97\u305F" },
        { label: "<60", value: "\u5927\u304D\u304F\u9038\u8131" },
      ],
    },
    f_score: {
      name: "Fスコア（作りやすさ）",
      definition: "オーブン、粉、経験に応じた作りやすさを0〜100点で示します。レシピを作れない条件は別に判定します。",
      ranges: [
        { label: "90-100", value: "\u5341\u5206\u306B\u4F5C\u308C\u308B" },
        { label: "75-89", value: "\u6CE8\u610F\u3059\u308C\u3070\u4F5C\u308C\u308B" },
        { label: "60-74", value: "\u96E3\u3057\u3044" },
        { label: "<60", value: "\u304A\u3059\u3059\u3081\u3057\u306A\u3044" },
      ],
    },
    d_score: {
      name: "Dスコア（熟成の推定）",
      definition: "時間、温度、イースト、前発酵の生地に基づくモデルの推定です。個人の消化やFODMAP量を測るものではありません。",
      ranges: [{"label":"85-100","value":"高い指数"},{"label":"70-84","value":"やや高い指数"},{"label":"50-69","value":"中程度の指数"},{"label":"<50","value":"低い指数"}],
    },
  },
};