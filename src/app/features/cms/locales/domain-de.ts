/* === DOMAIN DATA i18n — Deutsch === */
import type {
  CmsPreFerment,
  CmsTroubleshootingI18n,
  CmsGlossaryTerms,
  CmsScience,
} from "../cms-context";

export const PRE_FERMENT_DE: Partial<CmsPreFerment> = {
  sectionLabel: "Vorteig",
  tipsLabel: "Tipps",
  showComparison: "Biga vs Poolish vs Autolyse vergleichen",
  paramHydration: "Hydratation",
  paramDuration: "Dauer",
  paramTemperature: "Temperatur",
  paramYeast: "Frischhefe",
  detailFermentation: "G\u00E4rung",
  detailFlavor: "Geschmack",
  detailCrust: "Kruste",
  detailExtensibility: "Dehnbarkeit",
  detailIdealStyles: "Ideale Stile",
  /* FW-05 */
  techniqueLabel: "Technik",
  recipeContextLine: "In diesem Rezept: {yeast} Hefe auf {flour} Vorteigmehl ({pct}). Die gesamte Hefe des Teigs kommt in den Vorteig und ist auf die Gesamtstunden des Rezepts berechnet, nicht nur auf die des Vorteigs.",
  compLabels: [
    "Hydratation",
    "Frischhefe (bezogen auf das Vorteigmehl)",
    "Dauer",
    "Temperatur",
    "Geschmack",
    "Dehnbarkeit",
  ],
  items: {
    poolish: {
      origin: "Polen, dann Frankreich",
      description:
        "Flüssiger Vorteig: Mehl und Wasser zu gleichen Teilen mit wenig Hefe, 12–16 h bei 20–22 °C.",
      hydration: "100 % (Mehl und Wasser zu gleichen Teilen)",
      consistency: "Fl\u00FCssig, schaumig",
      fermentationType: "Schneller als eine Biga bei gleicher Hefe: mit der angegebenen Menge reift er in 12–16 h",
      flavor: "Leicht säuerlich, nussige Noten",
      crustResult:
        "Dünn und goldbraun; Farbe und Flecken hängen von Ofen und Temperatur ab",
      extensibility: "Hoch (Schätzung): leicht zu dehnen",
      tips: [
        "Fertig, wenn die Oberfläche voller Bläschen ist und die Mitte einzusinken beginnt",
        "Mehr Hefe, weniger Stunden: bei 20–22 °C 0,1 % für 15–16 h, 0,3 % für 10–12 h",
        "Mehl im Poolish: 30–50 % des gesamten Mehls; {brand} beginnt bei {poolishFlourPct}",
      ],
    },
    biga: {
      origin: "Italien",
      description: "Fester Vorteig: Mehl, {bigaHydration} Wasser und etwa 1 % Frischhefe bezogen auf das Mehl der Biga, etwa 16 h bei 18–20 °C.",
      hydration: "{bigaHydration} (bis 50 % mit Vollkornmehl)",
      consistency: "Trocken, kompakt",
      fermentationType: "Langsam: mit wenig Wasser reift sie in etwa 16 h (bis 48 h mit Kühlschrank)",
      flavor: "Aromatisch, blumig",
      crustResult: "Knusprig; die Struktur hängt von Hydration und Formen ab",
      extensibility:
        "Hängt von Mehl und Hydration ab (noch zu prüfen)",
      tips: [
        "Fertig, wenn sie stellenweise aufgegangen ist, nach Joghurt riecht und leicht prickelt; schmeckt sie sauer, ist sie zu weit",
        "Lange Biga: 24 h bei 4–5 °C, dann 24 h bei 18–20 °C",
        "Mehl in der Biga: meist 30–40 % des gesamten Mehls; {brand} beginnt bei {bigaFlourPct}, und du kannst es zwischen {flourPctMin} und {flourPctMax} ändern",
        "Nicht für die Pizza Napoletana g.t.S.: die Spezifikation erlaubt nur die direkte Führung",
      ],
    },
    autolisi: {
      origin: "R. Calvel, Frankreich 1974",
      description:
        "Kein Vorteig: Mehl und Wasser ruhen ohne Hefe und Salz vor dem Kneten.",
      hydration: "Die des Rezepts (oft hält man etwas Wasser zurück)",
      consistency: "Teigig",
      fermentationType: "Keine (nur Enzymaktivit\u00E4t)",
      flavor:
        "Neutral \u2014 ver\u00E4ndert den Geschmack nicht",
      crustResult:
        "Variabel \u2014 abh\u00E4ngig vom weiteren Prozess",
      extensibility:
        "Hoch \u2014 seidiger, weniger klebriger Teig",
      idealStyles: "Alle Stile (universelle Technik)",
      tips: [
        "20–60 Minuten ruhen lassen; Hefe und Salz kommen danach dazu",
        "Lässt sich mit Biga oder Poolish kombinieren",
      ],
    },
  },
  compValues: {
    hydration: {
      biga: "{bigaHydration}",
      poolish: "{poolishHydration}",
      autolisi: "= Rezept",
    },
    yeast: {
      biga: "1 %",
      poolish: "0,1–0,2 %",
      autolisi: "0%",
    },
    duration: {
      biga: "16 h (bis 48 h mit 24 h im Kühlschrank)",
      poolish: "12–16 h",
      autolisi: "20–60 min",
    },
    temperature: {
      biga: "18–20 °C (lange Biga: zuerst 24 h bei 4–5 °C)",
      poolish: "20–22 °C",
      autolisi: "Raumtemp.",
    },
    flavor: {
      biga: "Aromatisch",
      poolish: "Leicht säuerlich",
      autolisi: "Neutral",
    },
    extensibility: {
      biga: "Variabel",
      poolish: "Hoch (Schätzung)",
      autolisi: "Hoch",
    },
  },
};



export const TROUBLESHOOTING_DE: Partial<CmsTroubleshootingI18n> =
  {
    categories: {
      frying: "Frittieren",
      dough: "Teig",
      fermentation: "G\u00E4rung",
      shaping: "Formen",
      baking: "Backen",
      solver: "Algorithmus",
      false_positive: "Fehlalarme",
    },
    issues: {
      FR01: {
        symptom: "Außen goldbraun, innen roh",
        cause: "Öl zu heiß oder Teig zu dick.",
        testRapido: "Ein Probestück aufschneiden und die Mitte prüfen.",
        fixImmediate: "Für die nächsten Stücke die Hitze reduzieren; die Farbe allein zeigt den Garzustand nicht.",
        prevention: "Ein Thermometer verwenden und die Öltemperatur des Rezepts beachten.",
      },
      FR02: {
        symptom: "Fettig und nicht knusprig",
        cause: "Öl zu kühl oder durch zu viele Stücke abgekühlt.",
        testRapido: "Die Öltemperatur zwischen den Durchgängen prüfen.",
        fixImmediate: "Das Öl wieder auf Rezepttemperatur bringen; kleine Mengen frittieren und gut abtropfen lassen.",
        prevention: "Den Topf nicht überfüllen und die Temperatur überwachen.",
      },
      FR03: {
        symptom: "Füllung läuft ins Öl",
        cause: "Schlecht verschlossene Ränder, Löcher oder Füllung auf den Rändern.",
        testRapido: "Den Verschluss der noch rohen Stücke prüfen.",
        fixImmediate: "Die nächsten Stücke sorgfältiger verschließen; niemals Wasser ins heiße Öl geben.",
        prevention: "Ränder sauber halten, Füllung dosieren und den Teig ohne Löcher verschließen.",
      },

      P01: {
        symptom: "Anhaltend klebriger Teig",
        cause: "Mehr Wasser, als das Mehl aufnehmen kann",
        testRapido: "Liegt die Hydratation des Rezepts über der Wasseraufnahme im Datenblatt des Mehls?",
        fixImmediate: "Gib nach und nach etwas Mehl dazu (2–3 %) und arbeite es mit sanftem Falten ein",
        prevention: "Bleib nahe an der Wasseraufnahme, die die Mühle angibt; kennst du sie nicht, beginne am unteren Ende der Hydratation des Stils",
      },
      P02: {
        symptom: "Teig rei\u00DFt beim Dehnen",
        cause: "Gluten zu wenig entwickelt oder noch nicht entspannt, Teig noch kalt aus dem Kühlschrank; manchmal ein wenig dehnbares Mehl (hoher P/L) oder ein übergärter Teig",
        testRapido: "Zieh vorsichtig an einem Rand: reißt er sofort, statt sich zu dehnen?",
        fixImmediate: "Deck den Teigling ab und lass ihn 30–60 Min. bei Raumtemperatur ruhen, dann versuch es noch einmal",
        prevention: "Halte die Zeiten des Rezepts ein, nimm die Teiglinge rechtzeitig aus dem Kühlschrank und verwende ein Mehl mit dem P/L, den der Stil angibt",
      },
      P03: {
        symptom: "Teig kollabiert bei Ber\u00FChrung",
        cause: "Übergärt: zu lange, zu warm oder zu viel Hefe",
        testRapido: "Drück mit dem Finger hinein: kommt die Delle sofort zurück, ist er noch nicht so weit; kommt sie langsam zurück, ist er bereit; bleibt sie und fällt der Teig zusammen, ist er übergärt",
        fixImmediate: "Forme ihn neu und lass ihn 1–2 h nachgehen (er wird weniger Poren haben), oder zieh ihn vorsichtig aus und back ihn sofort",
        prevention: "Prüfe den Teig ab dem letzten Drittel der geplanten Zeit, nicht nur nach der Uhr",
      },
      P04: {
        symptom: "Der Teig geht in der geplanten Zeit nicht auf",
        cause: "Schwache oder abgelaufene Hefe oder ein kälterer Teig als geplant. Im Kühlschrank geht er nur wenig auf, das ist normal",
        testRapido: "War er im Kühlschrank? Dann ist das normal. Sonst löse eine Prise der Hefe mit etwas Zucker in lauwarmem Wasser: schäumt es nach 10–15 Min.?",
        fixImmediate: "Stell ihn zuerst 1–2 h an einen warmen Ort (24–28 °C). Kommt er nicht in Gang, ist die Hefe inaktiv: setz den Teig mit frischer Hefe neu an",
        prevention: "Prüfe das Haltbarkeitsdatum der Hefe und die Raumtemperatur",
      },
      P05: {
        symptom: "G\u00E4rung zu schnell (verdoppelt in <3h)",
        cause:
          "Zu viel Hefe (>1.5%) oder Raumtemperatur >28\u00B0C",
        testRapido:
          "Hat der Teig in weniger als 3 Stunden verdoppelt?",
        fixImmediate:
          "Den Teig kühlen, um die Fermentation zu verlangsamen; Kälte stoppt sie nicht sofort.",
        prevention:
          "Die für Ihre Stunden und Temperatur berechnete Hefemenge verwenden (bei 18 °C für 24 h etwa 0,1 % Frischhefe)",
      },
      P06: {
        symptom: "Zu saurer/essigartiger Geschmack",
        cause: "Reifung zu lang oder zu warm: Milchsäurebakterien bilden Säuren (häufiger mit Sauerteig)",
        testRapido: "Riech und probier ein kleines rohes Stück: ist die Säure stechend, wie Essig?",
        fixImmediate: "Man kann sie essen; verkürze beim nächsten Mal die Reifung bei Raumtemperatur",
        prevention: "Zeit, Temperatur und Hefe nach Methode wählen; Reife ohne universelle Stundengrenze prüfen.",
      },
      P07: {
        symptom:
          "Teigling springt nach Dehnen zur\u00FCck ('Gummiband-Effekt')",
        cause: "Gluten nicht ausreichend entspannt",
        testRapido:
          "Auf 30cm dehnen \u2014 springt nach 30s auf 25cm zur\u00FCck?",
        fixImmediate:
          "Zus\u00E4tzlich 15min abgedeckt ruhen, in 2 Phasen dehnen",
        prevention:
          "Teiglinge 60-90min vor dem Dehnen aus dem K\u00FChlschrank nehmen",
      },
      P08: {
        symptom:
          "Riesige unregelm\u00E4\u00DFige L\u00F6cher in der Pizza",
        cause: "Große Blasen im Teigling geblieben und sehr sanftes Ausziehen",
        testRapido: "Sind die großen Blasen auch in der Mitte verteilt, nicht nur im Rand?",
        fixImmediate:
          "Teigling vor dem Dehnen leicht dr\u00FCcken um Gas umzuverteilen",
        prevention: "Drück vor dem Ausziehen die größten Blasen vorsichtig aus; bei Neapolitanischer und Canotto-Pizza sind einige große Poren im Rand gewollt",
      },
      P09: {
        symptom: "Roher Boden aber verbrannter Rand",
        cause:
          "Thermisches Ungleichgewicht: zu viel Oberhitze, zu wenig Unterhitze",
        testRapido:
          "Extremer Farbkontrast zwischen oben und unten?",
        fixImmediate: "Back näher an der heißen Backfläche und weiter weg von der Oberhitze; wird der Ofen nicht heißer als 300 °C, kannst du den Boden 2–3 Min. ohne Belag vorbacken",
        prevention: "Gleiche die Hitze aus: gut vorgeheizter Stein oder Stahl unten, weniger Hitze von oben",
      },
      P10: {
        symptom: "Blasse Kruste, keine Br\u00E4unung",
        cause: "Ofen oder Backfläche für den Stil nicht heiß genug, oder nach einer sehr langen Reifung wenig Zucker übrig",
        testRapido: "Erreicht der Ofen die Temperatur des Stils? War die Reifung sehr lang?",
        fixImmediate: "Nutze in den letzten 1–2 Minuten den Grill, falls der Ofen einen hat",
        prevention: "Heiz den Ofen mit gut vorgeheiztem Stein oder Stahl auf die Höchststufe; außerhalb von STG-Rezepten, die weder Zucker noch Malz erlauben, kannst du 0,5–1 % Zucker oder Malz zugeben",
      },
      P11: {
        symptom: "Gummiartige, nicht knusprige Pizza",
        cause: "Backzeit zu kurz oder Temperatur zu niedrig für die Dicke, oder mehr Wasser, als der Stil vorsieht",
        testRapido: "Ist die Mitte beim Anschneiden noch feucht und klebrig?",
        fixImmediate: "Back ein paar Minuten länger; hat der Ofen noch Reserve, erhöhe die Temperatur",
        prevention: "Bleib bei der Hydratation des Stils und back so lange, wie das Rezept angibt",
      },
      P14: {
        symptom:
          "Leopardenflecken auf dem Rand (Leopard Spotting)",
        cause:
          "Dünne Blasen am Rand, die bei sehr starker Ofenhitze dunkel werden (örtliche Bräunung und Verkohlung)",
        testRapido: "Schmecken die Flecken bitter?",
        fixImmediate:
          "KEIN Problem! Ist das gew\u00FCnschte Merkmal der neapolitanischen Pizza",
        prevention:
          "Wenn zu stark: Pizza alle 20s w\u00E4hrend des Backens drehen",
      },
      P15: {
        symptom: "Dunkler/schwarzer Pizzaboden",
        cause: "Backfläche heißer, als der Stil braucht, oder verbranntes Mehl bzw. Grieß auf dem Stein",
        testRapido: "Probieren: bitterer Geschmack?",
        fixImmediate:
          "Wenn bitter = Problem (Temp senken). Wenn w\u00FCrzig = NORMAL",
        prevention: "Halte die Backfläche auf der Temperatur des Stils und bürste den Stein zwischen zwei Pizzen ab",
      },
      P16: {
        symptom: "Niedriger, flacher Rand",
        cause: "Zu stark entgast, Mehl für den Stil zu schwach oder Nudelholz benutzt",
        testRapido: "Randh\u00F6he <1cm?",
        fixImmediate:
          "Sanfteres Dehnen, R\u00E4nder nicht dr\u00FCcken",
        prevention: "Verwende ein Mehl in der Stärke, die der Stil angibt, und kein Nudelholz bei Stilen mit Rand",
      },
      P17: {
        symptom: "Pizza zu trocken",
        cause: "Weniger Wasser, als der Stil vorsieht, oder länger gebacken als im Rezept",
        testRapido: "Entsprechen Hydratation und Backzeit dem Rezept?",
        fixImmediate: "Servier sie direkt aus dem Ofen; verkürze beim nächsten Mal die Backzeit",
        prevention: "Bleib bei der Hydratation des Stils und überschreite die angegebene Backzeit nicht",
      },
      P18: {
        symptom: "W\u00E4ssrige Mitte der Pizza",
        cause: "Zu fl\u00FCssiger Belag oder zu kurze Backzeit",
        testRapido:
          "So\u00DFenmenge pro Pizza? Sehr feuchter Mozzarella?",
        fixImmediate: "Back den Boden 2–3 Min. vor und gib dann den Belag darauf",
        prevention:
          "Max 80ml So\u00DFe pro 30cm Pizza, Mozzarella gut abtropfen lassen",
      },
      P19: {
        symptom: "Teigling l\u00E4sst sich nicht dehnen",
        cause: "Mehl viel stärker, als der Stil vorsieht: der Teig ist zu zäh",
        testRapido: "Liegt der W-Wert deines Mehls deutlich über dem des Stils?",
        fixImmediate: "Lass den Teigling 20–30 Min. abgedeckt ruhen und versuch es noch einmal; mische beim nächsten Teig ein schwächeres Mehl unter",
        prevention: "Verwende ein Mehl mit der Stärke und dem P/L, die der Stil angibt",
      },
      P20: {
        symptom: "„Chemischer“ Geruch (Alkohol, Lösungsmittel) im Teig",
        cause: "Übergärung (Alkohol und Ester) oder zu viel Hefe; seltener Chlor im Wasser",
        testRapido: "Riecht er nach Alkohol oder Aceton, und ist der Teig schlaff und geht nicht mehr auf?",
        fixImmediate: "Ist er schlaff und geht nicht mehr auf, behandle ihn als übergärt: forme ihn neu oder back ihn sofort",
        prevention: "Nimm beim nächsten Mal weniger Hefe oder einen kühleren Ort. Schmeckt dein Leitungswasser nach Chlor, nimm ein anderes Wasser: Stehenlassen entfernt Chloramine nicht",
      },
      P21: {
        symptom: "Die Gärung schwankt von Teig zu Teig (Kühlschrank zu Hause)",
        cause: "Ein Haushaltskühlschrank hält die Temperatur nicht stabil: Abtauzyklen, Türöffnungen und unterschiedliche Fächer lassen die kalte Reifung schwanken, anders als eine Profi-Kühlzelle",
        testRapido: "Gleicher Stil, gleiche Hefemenge: Geht der Teig jedes Mal deutlich anders auf?",
        fixImmediate: "Stell den Teig ins unterste/mittlere Fach (am stabilsten) und beurteile den Teigling mit dem Auge, nicht nur nach der Uhr",
        prevention: "Temperatur am genutzten Fach messen und Teigreife beobachten. Zucker gleicht Kühlschwankungen nicht aus.",
      },
    },
    contextual: {
      sticky_dough: {
        message:
          "Hydratation {h}% bei W {w}: Risiko klebriger Teig",
        tip: "Dieser Stil sieht W {wMin}–{wMax} vor: nimm ein Mehl in diesem Bereich oder senke die Hydratation etwas",
      },
      high_pl: {
        message:
          "P/L {pl} hoch: m\u00F6glicherweise zu z\u00E4her Teig",
        tip: "45min Autolyse vor Salz- und Hefezugabe planen",
      },
      sour_risk: {
        message: "{h}h bei {t}\u00B0C: Risiko saurer Geschmack",
        tip: "Ist deine Küche warm, verlege einen Teil der Reifung in den Kühlschrank und achte mehr auf den Teig als auf die Uhr",
      },
      pale_crust: {
        message:
          "Kurze Fermentation: vor dem Fortfahren die Teigentwicklung prüfen.",
        tip: "Volumen, Elastizität und Druckreaktion prüfen: Die Stunden allein belegen keine Verdaulichkeit.",
      },
      cold_oven: {
        message: "Ofen bei {t}°C, unter der Temperatur des Stils: Gefahr einer blassen Kruste und einer trockenen Pizza",
        tip: "Heiz Stein oder Stahl lange vor und nutze in den letzten Minuten den Grill, falls der Ofen einen hat",
      },
      beginner_hydration: {
        message:
          "Hydratation {h}% ist anspruchsvoll f\u00FCr Anf\u00E4nger",
        tip: "Dieser Stil sieht {hMin}–{hMax} % vor: als Einsteiger bleib nahe bei {hMin} %",
      },
      high_w: {
        message: "W {w} deutlich über dem des Stils: Teig schwer auszuziehen",
        tip: "Dieser Stil sieht W {wMin}–{wMax} vor: misch ein schwächeres Mehl unter oder plane eine lange Autolyse ein",
      },
      flat_long_ferment: {
        message:
          "{h}h im K\u00FChlschrank ohne Vorteig: m\u00F6glicher flacher Geschmack",
        tip: "Vorteig (Poolish oder Biga) f\u00FCr Aromakomplexität hinzuf\u00FCgen",
      },
    },
  };

export const GLOSSARY_TERMS_DE: Partial<CmsGlossaryTerms> = {
  terms: {
    w_alveograph: {
      name: "W (Chopin-Alveograph)",
      definition: "Gesamtenergie, die n\u00F6tig ist, um eine Teigblase bis zum Platzen aufzubl\u00E4hen. Misst die Mehlst\u00E4rke insgesamt.",
      whyImportant: "W beschreibt die Gesamtstärke des Mehls. Dehnwiderstand und Dehnbarkeit werden mit P, L und P/L beurteilt: ein hoher W-Wert allein bedeutet keinen zäheren Teig. Diese Stufen verwendet {brand} in der ganzen App; jeder Stil nennt seinen eigenen W-Bereich.",
      ranges: [
        { label: "Schwach", value: "{wBandWeak}", note: "Allzweck- oder Gebäckmehl" },
        { label: "Mittel", value: "{wBandMedium}", note: "Oft als „Pizzamehl“ verkauft" },
        { label: "Stark", value: "{wBandStrong}", note: "Lange Reifung und sehr weiche Teige" },
        { label: "Sehr stark", value: "{wBandVeryStrong}", note: "Manitoba und Mehle für großes Hefegebäck" },
      ],
    },
    p_tenacity: {
      name: "P (Z\u00E4higkeit)",
      definition: "Maximaler Widerstand gegen Verformung. H\u00F6chstpunkt der Alveogrammkurve \u2014 wie stark sich der Teig dem Dehnen widersetzt.",
      whyImportant: "Hoher P: \u201Efester\u201C Teig, beh\u00E4lt beim Backen die Form. Niedriger P: \u201Eweicher\u201C Teig, leicht auszuziehen, kann zusammenfallen.",
      ranges: [
        { label: "Pizza", value: "40\u201380 mm" },
        { label: "Brot", value: "80\u2013120 mm" },
        { label: "Croissant", value: "100\u2013140 mm" },
      ],
    },
    l_extensibility: {
      name: "L (Dehnbarkeit)",
      definition: "Maximale L\u00E4nge, die die Teigblase vor dem Platzen erreicht. Misst, wie weit sich der Teig dehnen l\u00E4sst.",
      whyImportant: "Hoher L: dehnbarer Teig, l\u00E4sst sich ohne Risse ausziehen. Niedriger L: kurzer Teig, rei\u00DFt leicht.",
      ranges: [
        { label: "Pizza", value: "80\u2013120 mm" },
        { label: "Brot", value: "60\u2013100 mm" },
      ],
    },
    pl_ratio: {
      name: "P/L (Verh\u00E4ltnis Z\u00E4higkeit/Dehnbarkeit)",
      definition: "Verhältnis zwischen dem Verformungswiderstand des Teigs und seiner Dehnbarkeit.",
      whyImportant: "Beschreibt ein rheologisches Gleichgewicht: der passende Wert hängt von Mehl, Hydratation und Methode ab und garantiert weder Höhe noch Konsistenz der Pizza. Die Beispiele sind die Bereiche der Stile von {brand}; den P/L deines Mehls findest du im Datenblatt der Mühle.",
    },
    falling_number: {
      name: "Falling Number (Hagberg-Perten)",
      definition: "Zeit, die ein R\u00FChrstab braucht, um durch eine erhitzte Mehlsuspension zu fallen. Misst die Amylaseaktivit\u00E4t.",
      whyImportant: "Niedrige FN (<250): schnelle G\u00E4rung, aber instabiler Teig. Hohe FN (>300): stabil f\u00FCr lange Reifung.",
      ranges: [
        { label: "<200 Sehr hohe Amylase", value: "Klebriger Teig", note: "F\u00FCr Pizza nicht empfohlen" },
        { label: "200\u2013250 Hoch", value: "Feuchte Krume", note: "Schnelles Brot" },
        { label: "250\u2013300 Mittel", value: "Gute Balance", note: "Pizza 8-12h" },
        { label: "300\u2013400 Niedrig", value: "Trocken, langsam", note: "Pizza 24-48h" },
        { label: ">400 Sehr niedrig", value: "Trocken", note: "Trockenpasta" },
      ],
    },
    hydration: {
      name: "Hydratation (H%)",
      definition: "Gewichtsanteil des Wassers bezogen auf das Mehl im Teig.",
      formula: "H% = (Wassergewicht / Mehlgewicht) × 100",
      whyImportant: "Mehr Wasser macht den Teig weicher und schwieriger zu handhaben und verlangt ein stärkeres Mehl. Die Knusprigkeit hängt vor allem vom Backen und von der Dicke ab: auch eine sehr weiche Blechpizza kann knusprig werden. Die Beispiele sind die Bereiche der Stile von {brand}.",
    },
    absorption: {
      name: "Wasseraufnahme",
      definition: "Maximale Wassermenge, die ein Mehl aufnehmen kann und dabei gut verarbeitbar bleibt. H\u00E4ngt von Proteinen, besch\u00E4digter St\u00E4rke und Ballaststoffen ab.",
      ranges: [
        { label: "00 schwach (W150)", value: "50\u201352%" },
        { label: "00 mittel (W220)", value: "53\u201355%" },
        { label: "00 stark (W280)", value: "56\u201358%" },
        { label: "Vollkorn", value: "65\u201375%" },
        { label: "Manitoba (W380)", value: "60\u201365%" },
      ],
    },
    stability: {
      name: "Teigstabilit\u00E4t",
      definition: "Wie lange der Teig beim Kneten seine Konsistenz behält. Gemessen mit dem Farinographen.",
      whyImportant: "Geringe Stabilit\u00E4t (<5 min): baut bei \u00DCberkneten ab. Hohe (>10 min): verzeiht Fehler bei der Verarbeitung.",
      ranges: [
        { label: "Schwach", value: "2\u20134 min" },
        { label: "Mittel", value: "5\u20138 min" },
        { label: "Stark", value: "10\u201315 min" },
        { label: "Manitoba", value: "15\u201320 min" },
      ],
    },
    yeast: {
      name: "Hefe (Saccharomyces cerevisiae)",
      definition: "Ein einzelliger Pilz, der Zucker vergärt und dabei Kohlendioxid, Alkohol und Aromastoffe bildet.",
      whyImportant: "Die Aktivität hängt von Stamm, Menge, Temperatur und Teig ab. Kälte verlangsamt die Gärung; eine allgemeine Schwelle für einen sofortigen Stillstand gibt es nicht. Die richtige Menge hängt von Stunden und Temperatur ab: das Rezept berechnet sie für dich.",
      ranges: [
        { label: "Frisch, {yeastS1Hours} bei {yeastS1Temp}", value: "{yeastS1Pct}", note: "Modellschätzung" },
        { label: "Frisch, {yeastS2Hours} bei {yeastS2Temp}", value: "{yeastS2Pct}", note: "Modellschätzung" },
        { label: "Frisch, {yeastS3Hours} bei {yeastS3Temp}", value: "{yeastS3Pct}", note: "Modellschätzung" },
        { label: "Frisch, {yeastS4Hours} bei {yeastS4Temp}", value: "{yeastS4Pct}", note: "Modellschätzung" },
        { label: "Trocken (aktiv oder Instant)", value: "≈ frisch × {yeastDryRatio}", note: "Gleiche Schätzung wie frisch" },
      ],
    },
    lab: {
      name: "LAB (Milchs\u00E4urebakterien)",
      definition: "Bakterien, die Zucker verg\u00E4ren und dabei Milchs\u00E4ure (und Essigs\u00E4ure) bilden. Im Sauerteig enthalten.",
      whyImportant: "Sie können Säure und Fruktane je nach Stämmen, Mehl und Verfahren verändern. Ihre Anwesenheit belegt keine Low-FODMAP-Eignung.",
    },
    q10: {
      name: "Q\u2081\u2080 (Temperaturkoeffizient)",
      definition: "Faktor, um den sich die Geschwindigkeit einer biochemischen Reaktion pro 10\u00B0C Temperaturanstieg vervielfacht.",
      whyImportant: "Mit Q₁₀ = {q10ComAbove} vervielfacht sich die Geschwindigkeit alle {tenDegrees} um {q10ComAbove}: {q10ExampleRefHours} bei {q10RefTemp} ≈ {q10ExampleWarmHours} bei {q10ExampleWarmTemp}. Die Werte dieses Eintrags sind Schätzungen des Modells von {brand}.",
      ranges: [
        { label: "Backhefe ≥ {q10ComBreak}", value: "{q10ComAbove}", note: "Modellschätzung, passend zu Wachstumsdaten bei Raumtemperatur" },
        { label: "Backhefe < {q10ComBreak}", value: "{q10ComBelow}", note: "Modellschätzung, ohne Quelle" },
        { label: "Sauerteig > {q10SdBreak}", value: "{q10SdAbove}", note: "Modellschätzung" },
        { label: "Sauerteig ≤ {q10SdBreak}", value: "{q10SdBelow}", note: "Modellschätzung" },
      ],
    },
    arrhenius: {
      name: "Arrhenius-Gleichung",
      definition: "Verknüpft die Geschwindigkeit einer Reaktion über eine Aktivierungsenergie mit der absoluten Temperatur (in Kelvin).",
      formula: "k = A · e^(−Eₐ / (R · T)), mit T in Kelvin",
      whyImportant: "{brand} verwendet diese Gleichung nicht. Das Modell nutzt einen abschnittsweisen Q₁₀ bezogen auf {q10RefTemp}: {q10ComAbove} oberhalb und {q10ComBelow} unterhalb von {q10ComBreak} für Backhefe, {q10SdAbove} oberhalb und {q10SdBelow} bis {q10SdBreak} für Sauerteig. Das sind Modellschätzungen, keine Messwerte.",
    },
    biga: {
      name: "Biga",
      definition: "Fester Vorteig aus Mehl, {bigaHydration} Wasser (bis 50 % bei Vollkornmehl) und etwa 1 % Frischhefe bezogen auf das Mehl der Biga, etwa 16 h bei 18–20 °C gereift; die lange Biga reift 24 h bei 4–5 °C und danach 24 h bei 18–20 °C.",
      whyImportant: "Bringt Aroma und Struktur in den Hauptteig. Meist 30–40 % des gesamten Mehls: {brand} beginnt bei {bigaFlourPct}. In der Neapolitanischen STG nicht erlaubt, die eine direkte Führung vorschreibt.",
    },
    poolish: {
      name: "Poolish",
      definition: "Flüssiger Vorteig: Mehl und Wasser zu gleichen Teilen mit wenig Hefe, 12–16 h bei 20–22 °C gereift (0,1 % Hefe für 15–16 h, 0,3 % für 10–12 h).",
      whyImportant: "Reift schneller als eine Biga und macht den Teig dehnbar. Meist 30–50 % des gesamten Mehls: {brand} beginnt bei {poolishFlourPct}. Fertig, wenn die Oberfläche voller Bläschen ist und die Mitte nachzugeben beginnt.",
    },
    autolysis: {
      name: "Autolyse",
      definition: "Ruhe von Mehl und Wasser ohne Hefe und Salz, 20–60 Minuten vor dem Kneten (R. Calvel, 1974). Kein Vorteig.",
      whyImportant: "Der Teig wird dehnbarer und leichter zu verarbeiten.",
    },
    bulk_fermentation: {
      name: "Stockgare (Bulk Fermentation)",
      definition: "Erste Gare im Ganzen, nach dem Kneten und vor dem Abwiegen. Je nach Stil von unter einer Stunde bis über einen Tag im Kühlschrank: die richtige Dauer steht im Ablauf.",
      whyImportant: "Das Gluten entspannt sich, die Gärung beginnt und der Teig entwickelt Aroma.",
    },
    ball_fermentation: {
      name: "St\u00FCckgare (Ball Fermentation)",
      definition: "Zweite Gare nach dem Abwiegen: als Teiglinge oder, bei Blechstilen, direkt im Blech. Die Dauer hängt von Stil, Temperatur und Hefe ab: die richtige Dauer steht im Ablauf.",
      whyImportant: "Bringt die Teiglinge auf das richtige Volumen zum Ausziehen und Backen.",
    },
    maillard: {
      name: "Maillard-Reaktion",
      definition: "Eine Gruppe nichtenzymatischer Reaktionen zwischen Aminoverbindungen und reduzierenden Zuckern, die durch Erhitzen begünstigt werden.",
      whyImportant: "Sie trägt zu Farbe und Aroma der Kruste bei. Stärke und Geschwindigkeit hängen von Oberflächentemperatur, Zeit, Feuchte und Zutaten ab; Ofen- und Lebensmitteltemperatur sind nicht identisch.",
    },
    caramelization: {
      name: "Karamellisierung",
      definition: "Veränderungen von Zuckern beim Erhitzen, getrennt von Maillard-Reaktionen und ohne erforderliche Aminoverbindungen.",
      whyImportant: "Sie kann Farbe und Röstaromen beitragen. Der Effekt hängt von Zuckerart, Feuchte, Zeit und Oberflächentemperatur ab.",
    },
    starch_gelatinization: {
      name: "St\u00E4rkeverkleisterung",
      definition: "Durch Wasser und Wärme nehmen Stärkekörner Wasser auf, quellen und verlieren einen Teil ihrer Kristallstruktur. Der Temperaturbereich hängt von Stärke und Rezeptur ab.",
      whyImportant: "Sie trägt zur Krumenstruktur und Stärkeveränderung bei. Eine einzelne Kerntemperatur bestätigt weder vollständiges Durchbacken noch individuelle Verdaulichkeit.",
    },
    retrogradation: {
      name: "Retrogradation",
      definition: "Rekristallisierung der verkleisterten St\u00E4rke w\u00E4hrend der Lagerung. Am st\u00E4rksten bei 4\u00B0C (K\u00FChlschrank).",
      whyImportant: "Die Krume wird hart und \u201Ealtbacken\u201C. Verz\u00F6gern mit: Fett 2-3%, Zucker 1-2%, langer G\u00E4rung, hoher Hydratation.",
    },
    thermal_conductivity: {
      name: "W\u00E4rmeleitf\u00E4higkeit",
      definition: "F\u00E4higkeit eines Materials, W\u00E4rme zu leiten.",
      whyImportant: "Je höher k, desto schneller gibt die Fläche Wärme an den Boden ab: deshalb hilft Stahl im Haushaltsofen, der weniger heiß wird. Auf der Backfläche zählt auch, wie viel Wärme das Material speichert: Holzöfen haben Schamotte oder Biscotto.",
      ranges: [
        { label: "Kupfer", value: "400" },
        { label: "Aluminium", value: "205" },
        { label: "Kohlenstoffstahl", value: "50" },
        { label: "Edelstahl", value: "16" },
        { label: "Cordierit (Stein)", value: "2.5\u20133.5" },
        { label: "Schamottstein", value: "1.0\u20131.5" },
        { label: "Pizzateig", value: "0.5" },
      ],
    },
    fodmap: {
      name: "FODMAP",
      definition: "Fermentable Oligosaccharides, Disaccharides, Monosaccharides And Polyols. Kurzkettige, fermentierbare Kohlenhydrate (Fruktane 1-3% im Weizen).",
      whyImportant: "Fermentation kann den FODMAP-Gehalt verändern. Das Ergebnis hängt von Mehl, Mikroorganismen, Verfahren und Portionsgröße ab. Stunden allein erlauben weder eine Mengenangabe noch die Einstufung als FODMAP-arm.",
    },
    histamine: {
      name: "Histamin",
      definition: "Biogenes Amin aus der Decarboxylierung von Histidin. Wird von LAB w\u00E4hrend der G\u00E4rung gebildet und kommt in gereiftem K\u00E4se und Wurstwaren vor.",
      whyImportant: "Der Gehalt hängt von Mikroorganismen, Zutaten, Verarbeitung und Lagerung ab. Ein fester stündlicher Anstieg lässt sich nicht berechnen; kurze Gärung garantiert keine Abwesenheit.",
    },
    gluten: {
      name: "Gluten",
      definition: "Gliadin und Glutenin bilden mit Wasser und Kneten ein elastisches, dehnbares Netzwerk im Teig.",
      whyImportant: "Elastizit\u00E4t durch Glutenine (S-S-Bindungen), Viskosit\u00E4t durch Gliadine (H-Bindungen). Lange Proteolyse spaltet Bindungen \u2192 dehnbarerer Teig.",
    },
    proteolysis: {
      name: "Proteolyse",
      definition: "Protease-Enzyme zerlegen die Proteine im Teig in kleinere Moleküle wie Peptide und Aminosäuren.",
      whyImportant: "Sie kann Dehnbarkeit und Stabilität des Teigs verändern. Mehl, Mikroorganismen, Temperatur und Verfahren beeinflussen sie: Es gibt keine universelle optimale Dauer und keine Messung der individuellen Verdaulichkeit.",
    },
    thickness_factor: {
      name: "Thickness Factor (TF)",
      definition: "Teigmenge pro Fläche: Gramm Teig je cm² Pizza.",
      formula: "TF = Teiglinggewicht (g) / Pizzafläche (cm²)",
      whyImportant: "Eine in nordamerikanischen Teigrechnern verbreitete Kennzahl (in oz/in²; 1 oz/in² ≈ 4,39 g/cm²). {brand} gibt sie in g/cm² an, um die Teiglinge zu bemessen; zusammen mit dem Ofen bestimmt sie Backzeit und Knusprigkeit. Die Beispiele sind aus Teiglinggewicht und Form jedes Stils berechnet.",
    },
    friction_factor: {
      name: "Reibungsw\u00E4rme der Knetmaschine",
      definition: "Grad, die die Knetmaschine beim Arbeiten zum Teig hinzuf\u00FCgt.",
      whyImportant: "Kneten erw\u00E4rmt den Teig und l\u00E4sst ihn fr\u00FCher gehen: Deshalb muss das Wasser mit einer Maschine k\u00E4lter sein.",
      ranges: [
        { label: "Von Hand", value: "0" },
        { label: "Gabelkneter", value: "2" },
        { label: "Spiralkneter", value: "3" },
        { label: "K\u00FCchenmaschine (Haushaltsteige)", value: "4" },
        { label: "Planetenr\u00FChrwerk", value: "5" },
      ],
    },
    rule_of_55: {
      name: "Wassertemperatur (drei Temperaturen)",
      definition: "Berechnet, wie warm das Wasser sein muss, damit der Teig die gew\u00FCnschte Temperatur erreicht.",
      formula: "T_Wasser = 3 × T_Teig − T_Raum − T_Mehl − Reibung",
      whyImportant: "Summe der drei Temperaturen = 3 \u00D7 gew\u00FCnschter Teig \u2212 Reibung. In Pizzerien hei\u00DFt das auch \u00AB55er-Regel\u00BB: Mit der Summe fest auf 55 liegt der Teig bei etwa 18 \u00B0C (55 \u00F7 3); hier gilt die Zieltemperatur des Stils, 22\u201324 \u00B0C.",
    },
    a_score: {
      name: "A-Score (Authentizit\u00E4t)",
      definition: "Punktzahl von 0 bis 100 für die Nähe zur Stilreferenz. Sie bestätigt keine Konformität mit einem Regelwerk.",
      formula: "A = Zutaten × {authWIngredients} + Verfahren × {authWProcess} + Ausstattung × {authWEquipment}",
      ranges: [
        { label: "{aBand0}", value: "Streng authentisch" },
        { label: "{aBand1}", value: "Treu mit Anpassungen" },
        { label: "{aBand2}", value: "Inspiriert, aber verändert" },
        { label: "{aBand3}", value: "Frei interpretiert" },
      ],
      whyImportant: "Die Gewichte sind eine Entscheidung von {brand}, keine Messung. Produktregeln: ohne den Brennstoff, den der Stil vorsieht, liegt der Wert höchstens bei {authFuelCap}; unter der Mindesttemperatur des Stils sinkt er anteilig.",
    },
    f_score: {
      name: "F-Score (Schwierigkeitsgrad)",
      definition: "Punktzahl von 0 bis 100 für die einfache Zubereitung mit vorhandenem Ofen, Mehl und Erfahrung. Ausschlusskriterien werden gesondert geprüft.",
      formula: "F = Ofen × {feasWOven} + Mehl × {feasWFlour} + Erfahrung × {feasWSkill}",
      ranges: [
        { label: "{fBand0}", value: "Sehr gut machbar" },
        { label: "{fBand1}", value: "Machbar mit Sorgfalt" },
        { label: "{fBand2}", value: "Schwierig" },
        { label: "{fBand3}", value: "Hohes Risiko" },
      ],
      whyImportant: "Die Gewichte sind eine Entscheidung von {brand}, keine Messung. Lässt sich das Rezept mit deiner Küche nicht umsetzen, liegt die Kompatibilität höchstens bei {nonFeasibleCeiling}, unabhängig von den anderen Werten.",
    },
    d_score: {
      name: "D-Score (Geschätzte Reife)",
      definition: "Modellschätzung anhand von Zeit, Temperatur, Hefe und Vorteigen. Sie misst weder die persönliche Verdaulichkeit noch den FODMAP-Gehalt.",
      ranges: [{"label":"{dBand0}","value":"Hoher Index"},{"label":"{dBand1}","value":"Mittelhoher Index"},{"label":"{dBand2}","value":"Mittlerer Index"},{"label":"{dBand3}","value":"Niedriger Index"}],
    },
  },
};
/* FW-01 — Wissenschaftsregister: Texte der Notizen und Annahmen (Schlüssel wie SCIENCE_I18N_DEFAULTS). */
export const SCIENCE_DE: CmsScience = {
  notes: {
    "yeast-dose": {
      title: "Hefemenge",
      l1: "Das ist eine Schätzung: mehr Stunden und mehr Wärme brauchen weniger Hefe.",
      l2: "Wir gehen von einer Referenzmenge aus, die zu den neapolitanischen Regelwerken passt, und passen sie an deine Stunden und deine Temperatur an. Echte Hefe, echtes Mehl und echte Küchen können die Zeiten verschieben: achte mehr auf den Teig als auf die Uhr.",
    },
    "q10-fermentation": {
      title: "Temperatur und Gärgeschwindigkeit",
      l1: "Wärmer heißt schneller, kälter heißt langsamer. Der Faktor ist eine Schätzung.",
      l2: "Das Modell nutzt einen stufenweisen Geschwindigkeitsfaktor bezogen auf eine Referenztemperatur. Bei Raumtemperatur passt er zu Studien über Hefe; kühl und im Kühlschrank hat er keine Quelle und kann stark abweichen: prüfe den Teig.",
    },
    "equivalent-hours": {
      title: "Äquivalente Stunden",
      l1: "Deine Stunden, umgerechnet in die Stunden bei Referenztemperatur.",
      l2: "Wir multiplizieren die Stunden mit der Geschwindigkeit bei deiner Temperatur. Wenn du kühler als die Referenz gärst (Kühlschrank, Keller), finden die Stückgare und die Falt-Runden vor dem Kühlschrank bei der Referenztemperatur statt: Diese Stunden zählen so, wie sie sind, und nur die übrigen werden multipliziert. Deshalb geht «Stunden × Geschwindigkeit» allein nicht auf.",
    },
    "kitchen-temp-default": {
      title: "Küchentemperatur",
      l1: "Wenn du sie nicht angibst, nutzen wir einen Standardwert.",
      l2: "Die Küchentemperatur verändert Gärzeiten und Wassertemperatur. Der Standardwert ist eine Annahme: Ist deine Küche wärmer oder kälter, gib es an, und das Rezept passt sich an.",
    },
    "proof-split": {
      title: "Dauer der Stückgare",
      l1: "Wenn der Stil sie nicht angibt, ist die Stückgare ein fester Anteil der Gesamtstunden.",
      l2: "Das ist eine Annahme des Modells, keine Regel der Methode. Ist die Küche wärmer als erwartet, ist der Teig früher fertig: prüfe ihn.",
    },
    "sourdough-starter-dose": {
      title: "Menge Sauerteig",
      l1: "Die Sauerteigmenge ist eine Faustregel, die nur von den Stunden abhängt.",
      l2: "Sie berücksichtigt weder Temperatur noch die Kraft deines Sauerteigs. Mehl und Wasser des Sauerteigs zählen nicht zur angezeigten Hydration: Der echte Teig ist etwas feuchter.",
    },
    "pre-ferment": {
      title: "Biga und Poolish",
      l1: "Hydration, Stunden und Temperaturen stammen aus übereinstimmenden Fachquellen.",
      l2: "Biga ist ein fester Vorteig, der langsam im Kühlen reift; Poolish ist flüssig und reift schneller. Kruste und Krume hängen vor allem von Ofen, Hydration und Formen ab, nicht vom Vorteig allein.",
    },
    autolysis: {
      title: "Autolyse",
      l1: "Mehl und Wasser ruhen ohne Hefe und Salz vor dem Kneten.",
      l2: "Das ist kein Vorteig: Es gärt nichts. Das Mehl quillt, und der Teig lässt sich leichter verarbeiten (R. Calvel, 1974).",
    },
    "water-temp-rule": {
      title: "Wassertemperatur",
      l1: "Eine exakte Rechnung, die von einigen Annahmen über deine Küche ausgeht.",
      l2: "Küche, Mehl, Wasser und Knetwärme ergeben zusammen das Dreifache der gewünschten Teigtemperatur. Die Rechnung ist exakt; Küche und Mehl sind Schätzungen, wenn du sie nicht misst, und die Knetwärme ist ein typischer Wert.",
    },
    "water-activity": {
      title: "Wasseraktivität (aw)",
      l1: "Ein geschätzter Index, kein Messwert.",
      l2: "Wir berechnen ihn mit einer einfachen Formel aus Hydration, Salz und Zucker. Er dient dem Vergleich von Rezepten, nicht der Haltbarkeit: Für einen echten Wert braucht es ein Messgerät.",
    },
    "dough-indices": {
      title: "Teig-Indizes",
      l1: "Glutennetz und Proteolyse sind Indizes des Modells, keine Messwerte.",
      l2: "Sie kombinieren Mehlstärke, Hydration und Stunden mit Gewichten, die {brand} gewählt hat. Sie dienen dem Vergleich zweier Rezepte, sind aber keine Laborwerte.",
    },
    "salt-range": {
      title: "Salzbereich",
      l1: "Die Salzmarken sind eine Wahl von {brand}, kein Bereich aus einer Quelle.",
      l2: "Für die Napoletana STG gibt das Regelwerk einen genauen Bereich vor; bei anderen Stilen zeigen wir ein enges Band um den Rezeptwert.",
    },
    "stg-salt-timing": {
      title: "Salz in der Napoletana STG",
      l1: "Das Regelwerk löst das Salz im Wasser, bevor das Mehl dazukommt.",
      l2: "So steht es in der EU-Verordnung zur STG. Andere Methoden geben das Salz später dazu: Bei diesem Stil folgen wir dem Regelwerk.",
    },
    /* FW-02 */
    "stg-reference": {
      title: "Rezept und Spezifikation",
      l1: "Wir vergleichen einige Werte des Rezepts mit der Spezifikation der Napoletana STG.",
      l2: "Die Spezifikation (EU-Verordnung 97/2010) legt Mehl, Gare, Teiglingsgewicht und Backen fest. Liegt ein Wert außerhalb ihrer Bereiche, ist das Rezept „inspiriert von der STG“ und die Abweichung steht hier. Die Punktzahl bescheinigt keine Konformität.",
    },
    "flour-w-by-grade": {
      title: "Mehltyp und Stärke",
      l1: "00, 0, 1 und Vollkorn sagen, wie fein das Mehl ausgemahlen ist, nicht wie stark es ist.",
      l2: "Die Stärke (W) schwankt von Sack zu Sack, auch beim selben Typ. Steht sie nicht auf dem Sack, nutzt das Modell eine Schätzung für den Typ: Den echten Wert findest du im Datenblatt der Mühle.",
    },
    "flour-pl-estimate": {
      title: "Geschätztes P/L",
      l1: "Wenn du kein P/L angibst, schätzen wir es aus der Mehlstärke.",
      l2: "Das ist eine Näherung, begrenzt auf den Bereich des Stils. Der echte Wert steht im Datenblatt des Mehls.",
    },
    "stg-flour-w": {
      title: "Mehlstärke in der STG",
      l1: "Wir nutzen den Bereich der AVPN, der enger ist als der des STG-Regelwerks.",
      l2: "Die EU-Verordnung zur STG erlaubt schwächere und stärkere Mehle; die AVPN-Regeln engen den Bereich ein. Das ist eine Wahl von {brand}: Beide Quellen sind angegeben.",
    },
    "oven-max-temp": {
      title: "Höchsttemperatur des Ofens",
      l1: "Das ist die für dein Modell angegebene Temperatur.",
      l2: "Fast kein Hersteller sagt, ob es die Temperatur der Luft oder des Steins ist. Stammt der Wert von einem Händler oder einem Test, weisen wir darauf hin; Demo-Öfen haben erfundene Daten.",
    },
    "oven-preset-max-temp": {
      title: "Typische Temperatur der Ofenart",
      l1: "Ein typischer Wert: Korrigiere ihn mit dem deines Ofens.",
      l2: "Für einige Ofenarten haben wir kein Herstellerdatenblatt und keine Norm. Kennst du deinen Ofen, gib seine Temperatur an: Das Rezept passt sich an.",
    },
    "stg-oven-temp": {
      title: "Ofen der Napoletana STG",
      l1: "Die beiden Quellen nennen dieselbe Temperatur für verschiedene Flächen.",
      l2: "Das STG-Regelwerk bezieht sie auf den Ofenboden, die AVPN-Regeln auf die Kuppel. Keine erreicht das obere Ende des Bereichs, den das Modell nutzt: Dieser Wert ist noch zu prüfen.",
    },
    "style-min-oven-temp": {
      title: "Mindesttemperatur des Stils",
      l1: "Bei vielen Stilen ist das Minimum eine Wahl des Modells, ohne Quelle.",
      l2: "Unter dem Minimum ist das Rezept nicht machbar oder weniger stiltreu. Wo es ein Regelwerk gibt, folgen wir ihm; sonst ist die Schwelle noch zu prüfen.",
    },
    "bake-time-home-preheat": {
      title: "Vorheizen des Haushaltsofens",
      l1: "Die Vorheizdauer ist eine Annahme des Modells.",
      l2: "Stein und Stahl erwärmen sich langsamer als die Luft: Lege sie in den kalten Ofen, schalte ihn ein und miss, wenn möglich, die Fläche vor dem Einschießen.",
    },
    "surface-conductivity": {
      title: "Wärmeleitfähigkeit der Fläche",
      l1: "Wie schnell die Fläche Wärme an die Pizza abgibt.",
      l2: "Das ist die typische Wärmeleitfähigkeit des Materials in W/(m·K): Metalle stammen aus technischen Tabellen, Stein und Schamotte sind noch zu prüfen. Der Rost hat keine Kontaktfläche.",
    },
    "baking-energy": {
      title: "Backenergie",
      l1: "Eine Größenordnung, kein Messwert.",
      l2: "Wir multiplizieren die Backzeit mit einer typischen Leistung je nach Ofentemperatur, gleich für Holz, Gas und Strom. Das Vorheizen zählt nicht mit.",
    },
    "thickness-factor": {
      title: "Thickness Factor",
      l1: "Gramm Teig je cm² Pizza.",
      l2: "Eine in nordamerikanischen Teigrechnern verbreitete Kennzahl, in Unzen pro Quadratzoll; {brand} gibt sie in g/cm² an, um die Teiglinge zu bemessen.",
    },
    "score-weights": {
      title: "Gewichte der Bewertung",
      l1: "Die Gewichte der Dimensionen sind eine Wahl von {brand}.",
      l2: "Sie sagen, wie viel jede Dimension in der Endzahl zählt. Sie stammen aus keiner Messung: Es ist eine Regel der App, für alle gleich.",
    },
    "non-feasible-ceiling": {
      title: "Obergrenze für nicht machbare Rezepte",
      l1: "Ein Rezept, das du nicht machen kannst, bleibt im unteren Bereich: eine Regel der App.",
      l2: "So schlägt ein nicht machbares Rezept nie eines, das du machen kannst, auch wenn die anderen Dimensionen hoch sind.",
    },
    "authenticity-fuel-cap": {
      title: "Obergrenze der Authentizität beim Brennstoff",
      l1: "Ohne den Ofen, den der Stil verlangt, hat die Authentizität eine Obergrenze: eine Wahl von {brand}.",
      l2: "Verlangt ein Stil Holz oder Kohle, kann ein anderer Ofen gut backen, folgt aber nicht der Methode. Die Grenze ist redaktionell, kein Qualitätsmaß.",
    },
    digestibility: {
      title: "Verdaulichkeitsindex",
      l1: "Ein Modellindex für den Prozess, kein Gesundheitsversprechen.",
      l2: "Er berücksichtigt Reifestunden und -temperaturen. Er misst nicht, wie ein Mensch eine Pizza verdaut, und bescheinigt keine Eignung für eine Ernährungsweise.",
    },
    "troubleshooting-thresholds": {
      title: "Schwellen bei Problemen",
      l1: "Die Zahlenschwellen bei den Problemen sind Richtwerte.",
      l2: "Es sind Faustregeln ohne veröffentlichte Quelle, und sie berücksichtigen den Stil nicht: Ein Blechteig ist zum Beispiel viel feuchter als ein neapolitanischer. Nutze sie als Hinweis, nicht als Diagnose.",
    },
    /* FW-19: piano temporale. */
    "comfort-tolerances": {
      title: "Spielräume der Komfort-Timeline",
      l1: "Die Spielräume, mit denen die Komfort-Timeline die Wartezeiten verschiebt, sind unsere Wahl, keine Messung.",
      l2: "Wir verlängern oder verkürzen die Wartezeiten innerhalb fester Spielräume, im Kühlschrank größer als bei Raumtemperatur, ohne Stunden vom Kühlschrank zur Raumtemperatur zu verschieben und ohne die Hefe neu zu berechnen. Je weiter du dich vom Ausgangsplan entfernst, desto mehr zählt das Teigvolumen.",
    },
    "bake-round-recovery": {
      title: "Erholzeit des Ofens zwischen den Backvorgängen",
      l1: "Die Zeit zwischen zwei Backvorgängen ist eine Annahme des Modells.",
      l2: "Zwischen zwei Pizzen wird herausgeholt, eingeschossen und die Backfläche kommt wieder auf Temperatur: Der Haushaltsofen mit Stein braucht Minuten, Pizzaöfen weniger, Holzöfen fast nichts. Wir verwenden einen festen Wert pro Ofentyp, nicht an deinem Ofen gemessen.",
    },
  },
  assumptions: {
    "constant-ferment-temp": "Die Temperatur bleibt während der ganzen Phase gleich.",
    "time-exponent-no-source": "Die Korrektur für die Stunden nutzt einen vom Modell gewählten Exponenten, ohne Quelle.",
    "kitchen-temp-standard": "Wenn du die Küchentemperatur nicht angibst, nutzen wir einen Standardwert.",
    "q10-cold-no-source": "Kühl und im Kühlschrank hat der Geschwindigkeitsfaktor keine Quelle: Der Fehler kann groß sein.",
    "proof-share-default": "Ohne Angabe des Stils ist die Stückgare ein fester Anteil der Stunden.",
    "starter-steps-by-hours": "Die Sauerteigmenge sinkt stufenweise mit den Stunden, ohne die Temperatur zu berücksichtigen.",
    "starter-not-in-hydration": "Mehl und Wasser des Sauerteigs zählen nicht zur Hydration.",
    "preferment-at-maturation-temp": "Mit Vorteig hat der reife Vorteig die Mitte seiner Reifetemperatur (Biga 18–20 °C, Poolish 20–22 °C), und das Mischen von Hand erzeugt keine Reibungswärme.",
    "flour-at-kitchen-temp": "Das Mehl hat Küchentemperatur.",
    "mixer-friction-values": "Die Knetwärme ist ein typischer, noch zu prüfender Wert; von Hand ist sie null.",
    "coefficients-not-measured": "Die Koeffizienten der Formel wählt das Modell, sie sind nicht gemessen.",
    "grade-is-not-strength": "Der Mehltyp gibt die Ausmahlung an, nicht die Stärke: W je Typ ist eine Schätzung.",
    "oven-temp-surface-unspecified": "Wir wissen nicht, ob die angegebene Temperatur die der Luft oder des Steins ist.",
    "style-min-temp-no-source": "Die Mindesttemperatur des Stils hat keine schriftliche Quelle.",
    "preheat-home-minutes": "Die Vorheizdauer hängt nur von der Ofentemperatur ab, nicht von der Fläche.",
    "rack-no-contact": "Der Rost hat keine Kontaktfläche: Der Boden backt durch Strahlung und Luft.",
    "oven-power-steps": "Eine typische Leistung je Temperaturbereich, gleich für jeden Brennstoff.",
    "no-health-claim": "Keine Gesundheitsaussage: Der Index misst nicht, wie ein Mensch verdaut.",
    "thresholds-rules-of-thumb": "Die Schwellen sind allgemeine Faustregeln, nicht auf den Stil abgestimmt.",
    /* FW-19: piano temporale. */
    "comfort-margins-rule-of-thumb": "Die Spielräume, im Kühlschrank größer als bei Raumtemperatur, sind Faustregeln ohne Quelle.",
    "comfort-yeast-unchanged": "Die Hefemenge bleibt die für den Ausgangsplan berechnete.",
    "recovery-by-oven-type": "Die Erholzeit hängt nur vom Ofentyp ab, nicht vom Modell oder der Backfläche.",
    /* FW-02 */
    "stg-partial-check": "Wir vergleichen nur einige Werte: Herkunft der Zutaten, Teigtemperatur und Ausführung werden nicht geprüft.",
  },
};
