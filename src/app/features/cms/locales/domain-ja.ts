/* === DOMAIN DATA i18n — 日本語 === */
import type {
  CmsPreFerment,
  CmsTroubleshootingI18n,
  CmsGlossaryTerms,
  CmsScience,
} from "../cms-context";

export const PRE_FERMENT_JA: Partial<CmsPreFerment> = {
  sectionLabel: "\u524D\u767A\u9175\u7A2E",
  tipsLabel: "\u30A2\u30C9\u30D0\u30A4\u30B9",
  showComparison:
    "\u30D3\u30AC vs \u30DD\u30FC\u30EA\u30C3\u30B7\u30E5 vs \u30AA\u30FC\u30C8\u30EA\u30FC\u30BA\u3092\u6BD4\u8F03",
  paramHydration: "\u52A0\u6C34\u7387",
  paramDuration: "\u6642\u9593",
  paramTemperature: "\u6E29\u5EA6",
  paramYeast: "生イースト",
  detailFermentation: "\u767A\u9175",
  detailFlavor: "\u98A8\u5473",
  detailCrust: "\u30AF\u30E9\u30B9\u30C8",
  detailExtensibility: "\u4F38\u5C55\u6027",
  detailIdealStyles:
    "\u7406\u60F3\u7684\u306A\u30B9\u30BF\u30A4\u30EB",
  /* FW-05 */
  techniqueLabel: "技法",
  recipeContextLine: "このレシピでは、前発酵種の粉{flour}に対してイースト{yeast}（{pct}）。生地のイーストはすべて前発酵種に入れ、前発酵種の時間だけでなくレシピ全体の時間で量を決めています。",
  compLabels: [
    "加水率",
    "生イースト（前発酵種の粉に対して）",
    "時間",
    "温度",
    "風味",
    "伸展性",
  ],
  items: {
    poolish: {
      origin: "ポーランド、のちにフランス",
      description:
        "液種：粉と水を同量、少量のイースト、20〜22 °Cで12〜16時間。",
      hydration: "100%（粉と水が同量）",
      consistency: "\u6DB2\u4F53\u3001\u6CE1\u7ACB\u3061",
      fermentationType: "同じイースト量ならビガより早い：示した量なら12〜16時間で熟成",
      flavor:
        "ほのかな酸味、ナッツの風味",
      crustResult:
        "薄く黄金色。色や焼き斑は窯と温度で決まります",
      extensibility:
        "高い（推定）：伸ばしやすい",
      tips: [
        "表面が泡でいっぱいになり、中心がへこみ始めたら完成",
        "イーストが多いほど短時間：20〜22 °Cで0.1%なら15〜16時間、0.3%なら10〜12時間",
        "ポーリッシュに使う粉：全粉量の30〜50%。{brand}は{poolishFlourPct}から始めます",
      ],
    },
    biga: {
      origin: "イタリア",
      description: "硬い前発酵種：粉、水{bigaHydration}、ビガの粉に対して約1%の生イースト。18〜20 °Cで約16時間。",
      hydration: "{bigaHydration}（全粒粉なら50%まで）",
      consistency:
        "\u4E7E\u71E5\u3001\u30B3\u30F3\u30D1\u30AF\u30C8",
      fermentationType: "ゆっくり：水が少ないため約16時間で熟成（冷蔵を使えば48時間まで）",
      flavor:
        "芳醇、花のような香り",
      crustResult:
        "パリッとした食感。構造は加水と成形で決まります",
      extensibility:
        "粉と加水によります（要確認）",
      tips: [
        "ところどころ膨らみ、ヨーグルトの香りがして軽く泡立てば完成。酸っぱければ発酵しすぎ",
        "ロングビガ：4〜5 °Cで24時間、その後18〜20 °Cで24時間",
        "ビガに使う粉：通常は全粉量の30〜40%。{brand}は{bigaFlourPct}から始め、{flourPctMin}〜{flourPctMax}の範囲で変更できます",
        "STGナポリピッツァには使わない：規定はストレート法のみ",
      ],
    },
    autolisi: {
      origin: "R. カルヴェル、フランス 1974年",
      description:
        "元種ではない：イーストも塩も入れずに粉と水を休ませる工程。",
      hydration:
        "レシピと同じ（水を少し取り分けることが多い）",
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
      biga: "{bigaHydration}",
      poolish: "{poolishHydration}",
      autolisi: "= レシピ",
    },
    yeast: {
      biga: "1%",
      poolish: "0.1〜0.2%",
      autolisi: "0%",
    },
    duration: {
      biga: "16時間（冷蔵24時間を含めて最大48時間）",
      poolish: "12〜16時間",
      autolisi: "20〜60分",
    },
    temperature: {
      biga: "18〜20 °C（ロングビガは最初に4〜5 °Cで24時間）",
      poolish: "20〜22 °C",
      autolisi: "\u5BA4\u6E29",
    },
    flavor: {
      biga: "芳醇",
      poolish: "ほのかな酸味",
      autolisi: "\u4E2D\u6027",
    },
    extensibility: {
      biga: "条件による",
      poolish: "高い（推定）",
      autolisi: "\u9AD8\u3044",
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
        cause: "粉が吸収できる以上の水",
        testRapido: "レシピの加水率が、粉の規格書にある吸水率を超えていませんか？",
        fixImmediate: "粉を少しずつ（2〜3%）加え、やさしく折りたたんでなじませる",
        prevention: "製粉会社が示す吸水率に近づける。わからなければ、スタイルの加水率の下限から始める",
      },
      P02: {
        symptom:
          "\u4F38\u3070\u3059\u3068\u751F\u5730\u304C\u7834\u308C\u308B",
        cause: "グルテンの形成不足や緩み不足、冷蔵庫から出したばかりで冷たい生地。伸展性の低い粉（P/Lが高い）や過発酵のこともある",
        testRapido: "端をゆっくり伸ばしてみて、伸びずにすぐ切れますか？",
        fixImmediate: "生地玉に覆いをして室温で30〜60分休ませ、もう一度試す",
        prevention: "レシピの時間を守り、生地玉は早めに冷蔵庫から出し、スタイルが示すP/Lの粉を使う",
      },
      P03: {
        symptom:
          "\u89E6\u308B\u3068\u751F\u5730\u304C\u5D29\u308C\u308B",
        cause: "過発酵：時間が長すぎる、温度が高すぎる、またはイーストが多すぎる",
        testRapido: "指で押してみる。くぼみがすぐ戻ればまだ早い、ゆっくり戻れば適正、戻らずに生地がしぼめば過発酵",
        fixImmediate: "丸め直して1〜2時間休ませる（気泡は少なくなる）か、そっと伸ばしてすぐに焼く",
        prevention: "時計だけに頼らず、予定時間の最後の3分の1から生地を確認する",
      },
      P04: {
        symptom: "予定の時間がたっても生地が膨らまない",
        cause: "イーストの活性が低いか期限切れ、または生地が予定より冷たい。冷蔵中にあまり膨らまないのは正常",
        testRapido: "冷蔵庫に入れていましたか？それなら正常です。そうでなければ、イーストをひとつまみ、少量の砂糖とぬるま湯に溶かし、10〜15分後に泡立つか確認",
        fixImmediate: "まず暖かい場所（24〜28 °C）に1〜2時間置く。それでも動かなければイーストが不活性なので、新しいイーストで生地を作り直す",
        prevention: "イーストの期限と室温を確認する",
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
        cause: "熟成が長すぎるか温度が高すぎる：乳酸菌が酸をつくる（サワードウで起こりやすい）",
        testRapido: "生地を少し取ってにおいと味を確かめる。酢のようなツンとした酸味がありますか？",
        fixImmediate: "食べても問題ありません。次回は室温での熟成を短くする",
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
        cause: "生地玉に大きな気泡が残ったまま、とてもやさしく伸ばした",
        testRapido: "大きな気泡が縁だけでなく中央にも散らばっていますか？",
        fixImmediate:
          "\u4F38\u3070\u3059\u524D\u306B\u751F\u5730\u7389\u3092\u8EFD\u304F\u62BC\u3057\u3066\u30AC\u30B9\u3092\u518D\u5206\u914D",
        prevention: "伸ばす前に大きな気泡をそっとつぶす。ナポリピッツァやカノットでは、縁の大きな気泡は狙いどおり",
      },
      P09: {
        symptom:
          "\u751F\u5730\u304C\u751F\u3060\u304C\u7E01\u304C\u7126\u3052\u305F",
        cause:
          "\u71B1\u7684\u4E0D\u5747\u8861\uFF1A\u4E0A\u304B\u3089\u306E\u71B1\u304C\u591A\u304F\u3001\u4E0B\u304B\u3089\u306E\u71B1\u304C\u5C11\u306A\u3044",
        testRapido:
          "\u4E0A\u3068\u4E0B\u306E\u8272\u306E\u30B3\u30F3\u30C8\u30E9\u30B9\u30C8\u304C\u6975\u7AEF\uFF1F",
        fixImmediate: "熱い炉床に近づけ、上火から遠ざけて焼く。オーブンが300 °Cを超えない場合は、具をのせずに台を2〜3分下焼きしてもよい",
        prevention: "熱のバランスをとる：下はよく予熱した石や鋼板、上からの熱は控えめに",
      },
      P10: {
        symptom:
          "\u30AF\u30E9\u30B9\u30C8\u304C\u9752\u767D\u3044\u3001\u8272\u304C\u3064\u304B\u306A\u3044",
        cause: "オーブンや炉床がスタイルに対して低温、または非常に長い熟成で糖が少なくなっている",
        testRapido: "オーブンはスタイルの温度に達していますか？熟成がとても長くありませんでしたか？",
        fixImmediate: "オーブンにグリルがあれば、最後の1〜2分に使う",
        prevention: "よく予熱した石や鋼板でオーブンを最高温度にする。砂糖もモルトも認めないSTGのレシピ以外なら、砂糖かモルトを0.5〜1%加えてもよい",
      },
      P11: {
        symptom:
          "\u30B4\u30E0\u306E\u3088\u3046\u306A\u30D4\u30C3\u30C4\u30A1\u3001\u30AB\u30EA\u30AB\u30EA\u3067\u306A\u3044",
        cause: "厚みに対して焼き時間が短いか温度が低い、またはスタイルの想定より水が多い",
        testRapido: "切ると中心がまだ湿ってべたついていますか？",
        fixImmediate: "数分長く焼く。オーブンに余裕があれば温度を上げる",
        prevention: "スタイルの加水率を守り、レシピの焼き時間どおりに焼く",
      },
      P14: {
        symptom:
          "\u7E01\u306E\u30EC\u30AA\u30D1\u30FC\u30C9\u30B9\u30DD\u30C3\u30C8",
        cause:
          "縁の薄い気泡が窯の強い熱で色づく現象（局所的な焼き色と焦げ）",
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
        cause: "炉床がスタイルに必要な温度より高い、または石の上で粉やセモリナが焦げている",
        testRapido: "\u5473\u898B\uFF1A\u82E6\u3044\uFF1F",
        fixImmediate:
          "\u82E6\u3044 = \u554F\u984C\uFF08\u6E29\u5EA6\u3092\u4E0B\u3052\u308B\uFF09\u3002\u7F8E\u5473\u3057\u3044 = \u6B63\u5E38",
        prevention: "炉床をスタイルの温度に保ち、ピッツァを焼くたびに石をブラシで払う",
      },
      P16: {
        symptom: "\u7E01\u304C\u4F4E\u304F\u5E73\u3089",
        cause: "ガス抜きのしすぎ、スタイルに対して弱すぎる粉、またはめん棒の使用",
        testRapido: "\u7E01\u306E\u9AD8\u3055<1cm\uFF1F",
        fixImmediate:
          "\u3088\u308A\u7E4A\u7D30\u306A\u4F38\u3070\u3057\u3001\u7E01\u3092\u62BC\u3055\u306A\u3044",
        prevention: "スタイルが示す強さの粉を使い、縁のあるスタイルではめん棒を使わない",
      },
      P17: {
        symptom:
          "\u30D4\u30C3\u30C4\u30A1\u304C\u4E7E\u71E5\u3057\u3059\u304E\u308B",
        cause: "スタイルの想定より水が少ない、またはレシピより長く焼いた",
        testRapido: "加水率と焼き時間はレシピどおりですか？",
        fixImmediate: "焼きたてをすぐに出す。次回は焼き時間を短くする",
        prevention: "スタイルの加水率を守り、示された焼き時間を超えない",
      },
      P18: {
        symptom:
          "\u30D4\u30C3\u30C4\u30A1\u306E\u4E2D\u592E\u304C\u6C34\u3063\u307D\u3044",
        cause:
          "\u30C8\u30C3\u30D4\u30F3\u30B0\u306E\u6C34\u5206\u304C\u591A\u3059\u304E\u308B\u307E\u305F\u306F\u713C\u304D\u304C\u77ED\u3059\u304E\u308B",
        testRapido:
          "\u30D4\u30C3\u30C4\u30A1\u3042\u305F\u308A\u306E\u30BD\u30FC\u30B9\u91CF\uFF1F\u30E2\u30C3\u30C4\u30A1\u30EC\u30E9\u304C\u975E\u5E38\u306B\u6E7F\u3063\u3066\u3044\u308B\uFF1F",
        fixImmediate: "台を2〜3分下焼きしてから具をのせる",
        prevention:
          "30cm\u30D4\u30C3\u30C4\u30A1\u306B\u30BD\u30FC\u30B9\u6700\u594780ml\u3001\u30E2\u30C3\u30C4\u30A1\u30EC\u30E9\u3092\u3088\u304F\u6C34\u5207\u308A",
      },
      P19: {
        symptom:
          "\u751F\u5730\u7389\u304C\u4F38\u3070\u305B\u306A\u3044",
        cause: "スタイルの想定よりかなり強い粉：生地が締まりすぎている",
        testRapido: "お使いの粉のWは、スタイルの値を大きく上回っていませんか？",
        fixImmediate: "生地玉に覆いをして20〜30分休ませ、もう一度試す。次回はより弱い粉を混ぜる",
        prevention: "スタイルが示す強さとP/Lの粉を使う",
      },
      P20: {
        symptom: "生地から「化学的な」におい（アルコール、溶剤）がする",
        cause: "過発酵（アルコールとエステル）またはイーストの入れすぎ。まれに水の塩素",
        testRapido: "アルコールやアセトンのにおいがして、生地がだれて戻りませんか？",
        fixImmediate: "だれて戻らないなら過発酵として扱い、丸め直すかすぐに焼く",
        prevention: "次回はイーストを減らすか涼しい場所で。水道水に塩素の味がするなら別の水を使う。くみ置きではクロラミンは抜けない",
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
        tip: "このスタイルの想定はW{wMin}〜{wMax}です。この範囲の粉を使うか、加水率を少し下げてください",
      },
      high_pl: {
        message:
          "P/L {pl}\u304C\u9AD8\u3044\uFF1A\u751F\u5730\u304C\u5F37\u3059\u304E\u308B\u53EF\u80FD\u6027",
        tip: "\u5869\u3068\u30A4\u30FC\u30B9\u30C8\u3092\u52A0\u3048\u308B\u524D\u306B45\u5206\u306E\u30AA\u30FC\u30C8\u30EA\u30FC\u30BA\u3092\u8A08\u753B",
      },
      sour_risk: {
        message:
          "{h}h\u3001{t}\u00B0C\uFF1A\u9178\u5473\u306E\u30EA\u30B9\u30AF",
        tip: "キッチンが暖かいなら熟成の一部を冷蔵庫に移し、時計より生地の様子を見てください",
      },
      pale_crust: {
        message:
          "短い発酵です。次へ進む前に生地の状態を確認してください。",
        tip: "体積・弾力・押した時の戻りを確認してください。時間だけでは消化性を判断できません。",
      },
      cold_oven: {
        message: "オーブン{t}°Cはスタイルの温度より低め：焼き色が薄く乾いたピッツァになるおそれ",
        tip: "石や鋼板をしっかり予熱し、グリルがあれば最後の数分に使ってください",
      },
      beginner_hydration: {
        message:
          "\u52A0\u6C34\u7387{h}%\u306F\u521D\u5FC3\u8005\u306B\u306F\u96E3\u3057\u3044",
        tip: "このスタイルの想定は{hMin}〜{hMax}%です。初心者なら{hMin}%に近づけてください",
      },
      high_w: {
        message: "W{w}はスタイルの想定をかなり超えています：生地が伸ばしにくい",
        tip: "このスタイルの想定はW{wMin}〜{wMax}です。弱い粉を混ぜるか、長めのオートリーズを取ってください",
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
      whyImportant: "Wは小麦粉の総合的な強さを表します。弾力と伸展性はP、L、P/Lで評価し、Wが高いだけで生地が締まるわけではありません。この区分は{brand}がアプリ全体で使うもので、各スタイルには固有のWの範囲があります。",
      ranges: [
        { label: "弱い", value: "{wBandWeak}", note: "汎用粉・菓子用粉" },
        { label: "中", value: "{wBandMedium}", note: "「ピッツァ用」として売られることが多い" },
        { label: "強い", value: "{wBandStrong}", note: "長時間熟成や高加水の生地" },
        { label: "非常に強い", value: "{wBandVeryStrong}", note: "マニトバや大型の発酵菓子用の粉" },
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
      whyImportant: "レオロジー上のバランスを表します。適した値は粉、加水率、製法によって変わり、ピッツァの高さや食感を保証するものではありません。例は{brand}の各スタイルの範囲です。お使いの粉のP/Lは製粉会社の規格書に記載されています。",
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
      formula: "H% = (水の重量 / 粉の重量) × 100",
      whyImportant: "水が多いほど生地は柔らかく扱いにくくなり、より強い粉が必要になります。カリッとした食感は主に焼き方と厚みで決まり、加水の多い天板ピッツァでもカリッと焼けます。例は{brand}の各スタイルの範囲です。",
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
      whyImportant: "活性は菌株、量、温度、生地によって変わります。低温は発酵を遅くしますが、すぐに止まる普遍的な境界はありません。適量は時間と温度で決まり、レシピが計算します。",
      ranges: [
        { label: "生イースト、{yeastS1Temp}で{yeastS1Hours}", value: "{yeastS1Pct}", note: "モデルの推定値" },
        { label: "生イースト、{yeastS2Temp}で{yeastS2Hours}", value: "{yeastS2Pct}", note: "モデルの推定値" },
        { label: "生イースト、{yeastS3Temp}で{yeastS3Hours}", value: "{yeastS3Pct}", note: "モデルの推定値" },
        { label: "生イースト、{yeastS4Temp}で{yeastS4Hours}", value: "{yeastS4Pct}", note: "モデルの推定値" },
        { label: "ドライ（アクティブまたはインスタント）", value: "≈ 生 × {yeastDryRatio}", note: "生イーストと同じ推定" },
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
      whyImportant: "Q₁₀ = {q10ComAbove}なら、{tenDegrees}上がるごとに速度は{q10ComAbove}倍になります。{q10RefTemp}で{q10ExampleRefHours} ≈ {q10ExampleWarmTemp}で{q10ExampleWarmHours}。この項目の値は{brand}のモデルによる推定値です。",
      ranges: [
        { label: "市販イースト {q10ComBreak}以上", value: "{q10ComAbove}", note: "モデルの推定値。室温での増殖データと整合" },
        { label: "市販イースト {q10ComBreak}未満", value: "{q10ComBelow}", note: "モデルの推定値（出典なし）" },
        { label: "サワードウ {q10SdBreak}超", value: "{q10SdAbove}", note: "モデルの推定値" },
        { label: "サワードウ {q10SdBreak}以下", value: "{q10SdBelow}", note: "モデルの推定値" },
      ],
    },
    arrhenius: {
      name: "\u30A2\u30EC\u30CB\u30A6\u30B9\u306E\u5F0F",
      definition: "反応速度と絶対温度（ケルビン）の関係を、活性化エネルギーを介して表す式。",
      formula: "k = A · e^(−Eₐ / (R · T))（Tはケルビン）",
      whyImportant: "{brand}はこの式を使っていません。エンジンは{q10RefTemp}を基準とした区分的なQ₁₀を使います。市販イーストは{q10ComBreak}以上で{q10ComAbove}、未満で{q10ComBelow}、サワードウは{q10SdBreak}超で{q10SdAbove}、以下で{q10SdBelow}です。いずれもモデルの推定値で、測定値ではありません。",
    },
    biga: {
      name: "\u30D3\u30AC",
      definition: "粉、水{bigaHydration}（全粒粉なら50%まで）、ビガの粉に対して約1%の生イーストで作る硬い元種。18〜20 °Cで約16時間熟成。ロングビガは4〜5 °Cで24時間、さらに18〜20 °Cで24時間。",
      whyImportant: "本生地に香りと骨格を与えます。通常は全粉量の30〜40%で、{brand}は{bigaFlourPct}から始めます。STGナポリピッツァはストレート法のため使えません。",
    },
    poolish: {
      name: "\u30DD\u30FC\u30EA\u30C3\u30B7\u30E5",
      definition: "粉と水を同量、少量のイーストで作る液種。20〜22 °Cで12〜16時間熟成（イースト0.1%で15〜16時間、0.3%で10〜12時間）。",
      whyImportant: "ビガより早く熟成し、生地に伸びを与えます。通常は全粉量の30〜50%で、{brand}は{poolishFlourPct}から始めます。表面が泡でいっぱいになり、中央がへこみ始めたら使いどきです。",
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
      whyImportant: "kが大きいほど、表面から生地の底へ早く熱が伝わります。そのため温度の低い家庭用オーブンでは鋼板が役立ちます。炉床では素材がどれだけ熱を蓄えるかも重要で、薪窯には耐火れんがやビスコットが使われます。",
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
      formula: "TF = 生地玉の重さ (g) / ピッツァの面積 (cm²)",
      whyImportant: "北米の生地計算ツールで広く使われる指標です（oz/in²、1 oz/in² ≈ 4.39 g/cm²）。{brand}は生地玉の大きさを決めるためにg/cm²で表し、オーブンとあわせて焼成時間と食感の目安にします。例は各スタイルの生地玉の重さと形から計算しています。",
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
      formula: "T_水 = 3 × T_生地 − T_室温 − T_粉 − 摩擦",
      whyImportant: "3\u3064\u306E\u6E29\u5EA6\u306E\u5408\u8A08 = 3 \u00D7 \u76EE\u6A19\u751F\u5730\u6E29\u5EA6 \u2212 \u6469\u64E6\u71B1\u3002\u30D4\u30C3\u30C4\u30A7\u30EA\u30A2\u3067\u306F\u300C55\u306E\u6CD5\u5247\u300D\u3068\u3082\u547C\u3073\u307E\u3059\u3002\u5408\u8A08\u309255\u306B\u56FA\u5B9A\u3059\u308B\u3068\u751F\u5730\u306F\u7D0418 \u00B0C\uFF0855 \u00F7 3\uFF09\u3002\u3053\u3053\u3067\u306F\u30B9\u30BF\u30A4\u30EB\u306E\u76EE\u6A19\u6E29\u5EA622\u301C24 \u00B0C\u3092\u4F7F\u3044\u307E\u3059\u3002",
    },
    a_score: {
      name: "A-Score\uFF08\u6B63\u7D71\u6027\uFF09",
      definition: "元のスタイルへの近さを0〜100点で示します。規定への適合を認証するものではありません。",
      formula: "A = 材料 × {authWIngredients} + 工程 × {authWProcess} + 設備 × {authWEquipment}",
      ranges: [
        { label: "{aBand0}", value: "厳密に本格的" },
        { label: "{aBand1}", value: "調整ありで忠実" },
        { label: "{aBand2}", value: "着想を得て変更" },
        { label: "{aBand3}", value: "自由な解釈" },
      ],
      whyImportant: "重みは{brand}が決めたもので、測定値ではありません。製品上のルール：スタイルが求める燃料がない場合、スコアは{authFuelCap}を超えません。スタイルの最低温度を下回ると、比例して下がります。",
    },
    f_score: {
      name: "Fスコア（作りやすさ）",
      definition: "オーブン、粉、経験に応じた作りやすさを0〜100点で示します。レシピを作れない条件は別に判定します。",
      formula: "F = オーブン × {feasWOven} + 粉 × {feasWFlour} + 経験 × {feasWSkill}",
      ranges: [
        { label: "{fBand0}", value: "十分に実現可能" },
        { label: "{fBand1}", value: "注意すれば実現可能" },
        { label: "{fBand2}", value: "難しい" },
        { label: "{fBand3}", value: "高リスク" },
      ],
      whyImportant: "重みは{brand}が決めたもので、測定値ではありません。お使いのキッチンでレシピが作れない場合、相性は他のスコアに関係なく{nonFeasibleCeiling}を超えません。",
    },
    d_score: {
      name: "Dスコア（熟成の推定）",
      definition: "時間、温度、イースト、前発酵の生地に基づくモデルの推定です。個人の消化やFODMAP量を測るものではありません。",
      ranges: [{"label":"{dBand0}","value":"高い指数"},{"label":"{dBand1}","value":"やや高い指数"},{"label":"{dBand2}","value":"中程度の指数"},{"label":"{dBand3}","value":"低い指数"}],
    },
  },
};
/* FW-01 — 科学レジストリ：ノートと仮定のテキスト（キーは SCIENCE_I18N_DEFAULTS と同じ）。 */
export const SCIENCE_JA: CmsScience = {
  notes: {
    "yeast-dose": {
      title: "イーストの量",
      l1: "推定値です。時間が長く温度が高いほど、イーストは少なくて済みます。",
      l2: "ナポリの規定に沿った基準量から出発し、あなたの時間と温度に合わせて補正します。実際のイースト、粉、キッチンで時間はずれることがあります。時計より生地を見てください。",
    },
    "q10-fermentation": {
      title: "温度と発酵の速さ",
      l1: "温かいほど発酵は速く、寒いほど遅くなります。係数は推定値です。",
      l2: "モデルは基準温度に対する段階的な速度係数を使います。室温ではイーストの研究と一致しますが、低温や冷蔵庫では出典がなく、大きくずれることがあります。生地を確認してください。",
    },
    "equivalent-hours": {
      title: "換算時間",
      l1: "あなたの時間を、基準温度で必要な時間に換算したものです。",
      l2: "時間に、あなたの温度での速さを掛けます。基準より低い温度（冷蔵庫、貯蔵庫）で発酵させる場合、最終発酵は基準温度で行うため、その時間はそのまま数え、残りの時間だけに速さを掛けます。そのため「時間 × 速さ」だけでは計算が合いません。",
    },
    "kitchen-temp-default": {
      title: "キッチンの温度",
      l1: "入力しない場合は標準値を使います。",
      l2: "キッチンの温度は発酵時間と水温を変えます。標準値は仮定です。キッチンがもっと暖かい、または寒い場合は入力すると、レシピが合わせて変わります。",
    },
    "proof-split": {
      title: "最終発酵の時間",
      l1: "スタイルに指定がない場合、最終発酵は総時間の一定の割合です。",
      l2: "これはモデルの仮定で、製法のルールではありません。キッチンが想定より暖かいと生地は早く仕上がります。確認してください。",
    },
    "sourdough-starter-dose": {
      title: "サワードウ種の量",
      l1: "種の量は時間だけで決まる経験則です。",
      l2: "温度も種の力も考慮していません。種に含まれる粉と水は表示の加水率に入っていないため、実際の生地は少し加水が高くなります。",
    },
    "pre-ferment": {
      title: "ビガとポーリッシュ",
      l1: "加水率、時間、温度は、一致する業界の情報源に基づいています。",
      l2: "ビガは涼しい場所でゆっくり熟成する硬い前発酵種、ポーリッシュは液状で早く熟成します。クラストと気泡は前発酵種だけでなく、主に窯、加水、成形で決まります。",
    },
    autolysis: {
      title: "オートリーズ",
      l1: "こねる前に、粉と水をイーストも塩も入れずに休ませます。",
      l2: "前発酵ではなく、発酵は起きません。粉に水がなじみ、生地が扱いやすくなります（R. カルヴェル、1974年）。",
    },
    "water-temp-rule": {
      title: "水の温度",
      l1: "キッチンについていくつかの仮定から出発する、正確な計算です。",
      l2: "キッチン、粉、水、ミキサーの熱を合計すると、目標の生地温度の3倍になります。計算は正確ですが、キッチンと粉は測らなければ推定値で、ミキサーの熱は代表値です。",
    },
    "water-activity": {
      title: "水分活性（Aw）",
      l1: "測定値ではなく、推定した指標です。",
      l2: "加水率、塩、砂糖から簡単な式で計算します。レシピの比較に使うもので、ピザの日持ちを示すものではありません。本当の値には測定器が必要です。",
    },
    "dough-indices": {
      title: "生地の指標",
      l1: "グルテンネットワークとタンパク質分解はモデルの指標で、測定値ではありません。",
      l2: "粉の強さ、加水率、時間を{brand}が選んだ重みで組み合わせます。2つのレシピの比較に使うもので、実験室の値ではありません。",
    },
    "salt-range": {
      title: "塩の範囲",
      l1: "塩の目盛りは{brand}の選択で、出典のある範囲ではありません。",
      l2: "ナポレターナSTGでは規定が正確な範囲を示しています。ほかのスタイルでは、レシピの値の周りに狭い幅を表示します。",
    },
    "stg-salt-timing": {
      title: "ナポレターナSTGの塩",
      l1: "規定では、粉を加える前に塩を水に溶かします。",
      l2: "これはSTGのEU規則の順序です。ほかの製法では塩を後から加えますが、このスタイルでは規定に従います。",
    },
    "flour-w-by-grade": {
      title: "粉のタイプと強さ",
      l1: "00、0、1、全粒粉は粉の精製度を表し、強さではありません。",
      l2: "強さ（W）は同じタイプでも袋ごとに違います。袋に記載がなければ、モデルはタイプごとの推定値を使います。本当の値は製粉会社の仕様書で確認してください。",
    },
    "flour-pl-estimate": {
      title: "推定P/L",
      l1: "P/Lを入力しない場合、粉の強さから推定します。",
      l2: "スタイルの範囲内に収めた近似の関係です。本当の値は粉の仕様書にあります。",
    },
    "stg-flour-w": {
      title: "STGの粉の強さ",
      l1: "STGの規定より狭い、AVPNの範囲を使っています。",
      l2: "STGのEU規則はより弱い粉も強い粉も認めていますが、AVPNの規定は範囲を狭めています。これは{brand}の選択で、両方の出典を示しています。",
    },
    "oven-max-temp": {
      title: "窯の最高温度",
      l1: "あなたの機種について公表されている温度です。",
      l2: "空気の温度か石の温度かを示すメーカーはほとんどありません。販売店やレビューからのデータにはその旨を表示します。デモの窯のデータは架空のものです。",
    },
    "oven-preset-max-temp": {
      title: "窯の種類ごとの代表温度",
      l1: "代表値です。お使いの窯の値に直してください。",
      l2: "一部の窯の種類には、メーカーの仕様書や規格がありません。お使いの窯をご存じなら温度を入力してください。レシピが合わせて変わります。",
    },
    "stg-oven-temp": {
      title: "ナポレターナSTGの窯",
      l1: "2つの出典は同じ温度を、異なる面について示しています。",
      l2: "STGの規定は窯床、AVPNの規定はドームの温度としています。どちらもエンジンが使う範囲の上限には達していないため、その値は要確認です。",
    },
    "style-min-oven-temp": {
      title: "スタイルの最低温度",
      l1: "多くのスタイルで、最低温度は出典のないモデルの選択です。",
      l2: "最低温度を下回ると、レシピは実現できないか、忠実さが下がります。規定がある場合はそれに従い、ほかは要確認の値です。",
    },
    "bake-time-home-preheat": {
      title: "家庭用オーブンの予熱",
      l1: "予熱時間はモデルの仮定です。",
      l2: "石や鉄板は空気よりゆっくり温まります。冷たいオーブンに入れてから点火し、できれば焼く前に表面の温度を測ってください。",
    },
    "surface-conductivity": {
      title: "焼き面の熱伝導率",
      l1: "焼き面がピザに熱を伝える速さです。",
      l2: "素材の代表的な熱伝導率で、単位はW/(m·K)です。金属は技術資料の値、石と耐火レンガは要確認の値です。網には接触面がありません。",
    },
    "baking-energy": {
      title: "焼成エネルギー",
      l1: "おおよその規模で、測定値ではありません。",
      l2: "焼成時間に、窯の温度で決めた代表的な出力を掛けます。薪、ガス、電気で同じ値です。予熱は含みません。",
    },
    "thickness-factor": {
      title: "Thickness factor",
      l1: "ピザ1cm²あたりの生地のグラム数です。",
      l2: "北米の生地計算ツールで広く使われる指標で、単位は1平方インチあたりのオンスです。{brand}は生地玉の大きさを決めるためにg/cm²で表します。",
    },
    "score-weights": {
      title: "スコアの重み",
      l1: "各項目の重みは{brand}の選択です。",
      l2: "最終的な数値で各項目がどれだけ効くかを示します。測定から来たものではなく、全員に同じアプリのルールです。",
    },
    "non-feasible-ceiling": {
      title: "実現できないレシピの上限",
      l1: "作れないレシピは低い帯にとどまります。アプリのルールです。",
      l2: "ほかの項目が高くても、実現できないレシピが作れるレシピを上回ることはありません。",
    },
    "authenticity-fuel-cap": {
      title: "燃料による本格度の上限",
      l1: "スタイルが求める窯がないと、本格度に上限があります。{brand}の選択です。",
      l2: "薪や石炭が必要なスタイルでは、ほかの窯でもよく焼けますが製法には沿っていません。上限は編集上の線引きで、品質の測定ではありません。",
    },
    digestibility: {
      title: "消化性指数",
      l1: "工程についてのモデルの指標で、健康を約束するものではありません。",
      l2: "熟成の時間と温度を考慮します。人がピザをどう消化するかは測っておらず、食事法への適合を保証するものでもありません。",
    },
    "troubleshooting-thresholds": {
      title: "トラブルの目安",
      l1: "トラブルに出てくる数値の目安は参考値です。",
      l2: "公表された出典のない経験則で、スタイルを考慮していません。たとえば天板の生地はナポリピッツァよりずっと加水が高めです。診断ではなく、ヒントとして使ってください。",
    },
  },
  assumptions: {
    "constant-ferment-temp": "その工程の間、温度は一定とします。",
    "time-exponent-no-source": "時間の補正には、モデルが選んだ出典のない指数を使います。",
    "kitchen-temp-standard": "キッチンの温度を入力しない場合は標準値を使います。",
    "q10-cold-no-source": "低温や冷蔵庫では速度係数に出典がなく、誤差が大きくなることがあります。",
    "proof-share-default": "スタイルに指定がない場合、最終発酵は時間の一定の割合です。",
    "starter-steps-by-hours": "種の量は温度を考えず、時間に応じて段階的に減ります。",
    "starter-not-in-hydration": "種に含まれる粉と水は加水率に入っていません。",
    "preferment-at-maturation-temp": "中種がある場合、熟成した中種は熟成温度の中間（ビガ18～20 °C、ポーリッシュ20～22 °C）にあり、手で混ぜるため摩擦熱は加わらないとします。",
    "flour-at-kitchen-temp": "粉はキッチンの温度とします。",
    "mixer-friction-values": "ミキサーの熱は要確認の代表値で、手ごねでは0です。",
    "coefficients-not-measured": "式の係数はモデルが選んだもので、測定値ではありません。",
    "grade-is-not-strength": "粉のタイプは精製度を表し、強さではありません。タイプごとのWは推定値です。",
    "oven-temp-surface-unspecified": "公表温度が空気の温度か石の温度かは分かりません。",
    "style-min-temp-no-source": "スタイルの最低温度には文書の出典がありません。",
    "preheat-home-minutes": "予熱時間は窯の温度だけで決まり、焼き面は考慮しません。",
    "rack-no-contact": "網には接触面がなく、底は放射と空気で焼けます。",
    "oven-power-steps": "温度帯ごとの代表的な出力で、どの燃料でも同じです。",
    "no-health-claim": "健康に関する主張はしません。指数は人の消化を測るものではありません。",
    "thresholds-rules-of-thumb": "目安は一般的な経験則で、スタイルに合わせて調整していません。",
  },
};
