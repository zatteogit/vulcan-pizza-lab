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
  paramYeast: "Hefe",
  detailFermentation: "G\u00E4rung",
  detailFlavor: "Geschmack",
  detailCrust: "Kruste",
  detailExtensibility: "Dehnbarkeit",
  detailIdealStyles: "Ideale Stile",
  compLabels: [
    "Hydratation",
    "Hefe",
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
      fermentationType:
        "Schnell: mit viel Wasser reift er in wenigen Stunden",
      flavor: "Leicht säuerlich, nussige Noten",
      crustResult:
        "Dünn und goldbraun; Farbe und Flecken hängen von Ofen und Temperatur ab",
      extensibility: "Hoch (Schätzung): leicht zu dehnen",
      idealStyles:
        "Teglia Romana, NY Style, Zeitgen\u00F6ssische Neapolitanische, Focaccia",
      tips: [
        "Fertig, wenn die Oberfläche voller Bläschen ist und die Mitte einzusinken beginnt",
        "Mehr Hefe, weniger Stunden: bei 20–22 °C 0,1 % für 15–16 h, 0,3 % für 10–12 h",
        "Mehl im Poolish: 30–50 % des Gesamtmehls",
      ],
    },
    biga: {
      origin: "Italien",
      description:
        "Fester Vorteig: Mehl, 44 % Wasser und 1 % Hefe, etwa 16 h bei 18–20 °C.",
      hydration: "44 % (bis 50 % mit Vollkornmehl)",
      consistency: "Trocken, kompakt",
      fermentationType:
        "Langsam: mit wenig Wasser reift sie in 16–48 h",
      flavor: "Aromatisch, blumig",
      crustResult: "Knusprig; die Struktur hängt von Hydration und Formen ab",
      extensibility:
        "Hängt von Mehl und Hydration ab (noch zu prüfen)",
      idealStyles:
        "Pinsa, Pizza al taglio, Pala romana, Brot",
      tips: [
        "Fertig, wenn sie stellenweise aufgegangen ist, nach Joghurt riecht und leicht prickelt; schmeckt sie sauer, ist sie zu weit",
        "Lange Biga: 24 h bei 4–5 °C, dann 24 h bei 18–20 °C",
        "Mehl in der Biga: 20–50 % des Gesamtmehls, meist ein Drittel",
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
      biga: "44 %",
      poolish: "100%",
      autolisi: "= Rezept",
    },
    yeast: {
      biga: "1 %",
      poolish: "0,1–0,3 %",
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
        cause:
          "Hydratation \u00FCbersteigt Absorptionsf\u00E4higkeit des Mehls",
        testRapido:
          "Vergleiche H% Rezept vs Mehlabsorption (+5% max)",
        fixImmediate:
          "2-3% Mehl hinzuf\u00FCgen, mit sanften Falten einarbeiten",
        prevention: "H% \u2264 Mehlabsorption + 5% verwenden",
      },
      P02: {
        symptom: "Teig rei\u00DFt beim Dehnen",
        cause:
          "P/L zu hoch (>0.8) oder unzureichende G\u00E4rung (<6h)",
        testRapido: "Teigling 10cm dehnen: rei\u00DFt er?",
        fixImmediate:
          "60min abgedeckt bei Raumtemperatur ruhen lassen",
        prevention:
          "Mehle mit P/L 0.5-0.6, mindestens 8h G\u00E4rung",
      },
      P03: {
        symptom: "Teig kollabiert bei Ber\u00FChrung",
        cause:
          "\u00DCberg\u00E4rt (Volumen >150%, Fingertest kehrt nicht zur\u00FCck)",
        testRapido:
          "1cm mit Finger dr\u00FCcken: kehrt in 3-5s zur\u00FCck?",
        fixImmediate:
          "Irreversibel. Vorsichtig dehnen und sofort backen",
        prevention:
          "Volumen alle 6h kontrollieren, max +150% Zunahme",
      },
      P04: {
        symptom: "Kein Aufgehen nach 6+ Stunden",
        cause:
          "Tote Hefe, Temperatur zu niedrig, oder Salz in direktem Kontakt",
        testRapido:
          "Vitalit\u00E4tstest: 5g Hefe + 5g Zucker in 100ml Wasser 35\u00B0C \u2014 Schaum nach 15min?",
        fixImmediate:
          "0.3% Frischhefe in lauwarmem Wasser aufl\u00F6sen, mit Falten einarbeiten",
        prevention: "Hefe vor jedem Gebrauch testen",
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
        cause:
          "Heterofermentative LAB aktiv >48h bei >18\u00B0C (besonders mit Sauerteig)",
        testRapido:
          "Teig-pH \u2014 sollte 4.5-5.5 sein, problematisch wenn <4.2",
        fixImmediate:
          "Zucker überdeckt den Geschmack, korrigiert aber keine Übergare. Teig vor Gebrauch prüfen.",
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
        cause: "Unzureichende Entgasung + zu sanftes Dehnen",
        testRapido:
          "Poren >3cm und ungleichm\u00E4\u00DFige Verteilung?",
        fixImmediate:
          "Teigling vor dem Dehnen leicht dr\u00FCcken um Gas umzuverteilen",
        prevention: "G\u00E4rzeit um 20% reduzieren",
      },
      P09: {
        symptom: "Roher Boden aber verbrannter Rand",
        cause:
          "Thermisches Ungleichgewicht: zu viel Oberhitze, zu wenig Unterhitze",
        testRapido:
          "Extremer Farbkontrast zwischen oben und unten?",
        fixImmediate: "Boden 3min ohne Belag vorbacken",
        prevention:
          "Dickeres Blech/Stein verwenden, Ober-/Unterhitze ausgleichen",
      },
      P10: {
        symptom: "Blasse Kruste, keine Br\u00E4unung",
        cause:
          "Temperatur <250\u00B0C, Zucker ersch\u00F6pft, oder \u00FCberm\u00E4\u00DFige Oberfl\u00E4chenfeuchtigkeit",
        testRapido:
          "Erreicht der Ofen mindestens 250\u00B0C? G\u00E4rung >48h?",
        fixImmediate:
          "\u00D6l+Honig vor dem Backen aufpinseln oder Grill 2min zum Schluss",
        prevention:
          "0,5–1 % Zucker oder Malz zugeben und den Ofen auf Höchststufe stellen, mit gut vorgeheiztem Stein oder Stahl",
      },
      P11: {
        symptom: "Gummiartige, nicht knusprige Pizza",
        cause:
          "Kerntemperatur <85\u00B0C, Hydratation >70%, oder zu langsames Backen",
        testRapido: "Kernthermometer: erreicht 90\u00B0C+?",
        fixImmediate:
          "Backzeit +2min verl\u00E4ngern oder Temperatur +20\u00B0C erh\u00F6hen",
        prevention:
          "H \u2264 65%, Kerntemperatur-Ziel 95\u00B0C",
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
        cause: "Stein oder Blech zu hei\u00DF (>450\u00B0C)",
        testRapido: "Probieren: bitterer Geschmack?",
        fixImmediate:
          "Wenn bitter = Problem (Temp senken). Wenn w\u00FCrzig = NORMAL",
        prevention:
          "Kontrolliertes Vorheizen des Steins, nicht \u00FCber 400\u00B0C",
      },
      P16: {
        symptom: "Niedriger, flacher Rand",
        cause:
          "\u00DCberm\u00E4\u00DFige Entgasung, Mehl-W zu niedrig, oder Nudelholz verwendet",
        testRapido: "Randh\u00F6he <1cm?",
        fixImmediate:
          "Sanfteres Dehnen, R\u00E4nder nicht dr\u00FCcken",
        prevention:
          "W \u2265 240 f\u00FCr Neapolitanische, nie Nudelholz bei Stilen mit Rand",
      },
      P17: {
        symptom: "Pizza zu trocken",
        cause:
          "Hydratation <55% oder zu lange gebacken (>10min)",
        testRapido:
          "H% des Rezepts? Tats\u00E4chliche Backzeit?",
        fixImmediate: "Reichlich \u00D6l auf den Belag geben",
        prevention:
          "H \u2265 58%, empfohlene Backzeit nicht \u00FCberschreiten",
      },
      P18: {
        symptom: "W\u00E4ssrige Mitte der Pizza",
        cause: "Zu fl\u00FCssiger Belag oder zu kurze Backzeit",
        testRapido:
          "So\u00DFenmenge pro Pizza? Sehr feuchter Mozzarella?",
        fixImmediate:
          "Boden 2min vorbacken, dann Belag hinzuf\u00FCgen",
        prevention:
          "Max 80ml So\u00DFe pro 30cm Pizza, Mozzarella gut abtropfen lassen",
      },
      P19: {
        symptom: "Teigling l\u00E4sst sich nicht dehnen",
        cause:
          "Reines Manitoba-Mehl (W >380), Teig zu z\u00E4h",
        testRapido: "Welches Mehl hast du verwendet? W >350?",
        fixImmediate:
          "50:50 mit Mehl W 200 im n\u00E4chsten Teig mischen",
        prevention:
          "Max W 320 f\u00FCr Pizza, Mehle mit P/L 0.5-0.6",
      },
      P20: {
        symptom: "'Chemischer' Geruch im Teig",
        cause: "Leitungswasser mit hohem Chlorgehalt",
        testRapido:
          "Starker Geruch beim \u00D6ffnen des Wasserhahns?",
        fixImmediate:
          "Flaschenwasser f\u00FCr den n\u00E4chsten Teig verwenden",
        prevention:
          "Wasser filtern oder 12h offen stehen lassen (Chlor verdampft)",
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
        tip: "Mehl mit W \u2265 280 verwenden oder Hydratation auf 68-70% senken",
      },
      high_pl: {
        message:
          "P/L {pl} hoch: m\u00F6glicherweise zu z\u00E4her Teig",
        tip: "45min Autolyse vor Salz- und Hefezugabe planen",
      },
      sour_risk: {
        message: "{h}h bei {t}\u00B0C: Risiko saurer Geschmack",
        tip: "F\u00FCr G\u00E4rungen >24h Temperatur 4-8\u00B0C verwenden",
      },
      pale_crust: {
        message:
          "Kurze Fermentation: vor dem Fortfahren die Teigentwicklung prüfen.",
        tip: "Volumen, Elastizität und Druckreaktion prüfen: Die Stunden allein belegen keine Verdaulichkeit.",
      },
      cold_oven: {
        message:
          "Ofen bei {t}\u00B0C: Risiko roher Boden mit verbranntem Rand",
        tip: "Boden 3min ohne Belag vorbacken, dann Zutaten hinzuf\u00FCgen",
      },
      beginner_hydration: {
        message:
          "Hydratation {h}% ist anspruchsvoll f\u00FCr Anf\u00E4nger",
        tip: "Mit 60-65% beginnen und mit Erfahrung schrittweise erh\u00F6hen",
      },
      high_w: {
        message: "W {w} sehr hoch: Teig schwer zu dehnen",
        tip: "50:50 mit Mehl W 200 mischen oder lange Autolyse planen",
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
      plainDefinition: "Die Stärke des Mehls: Je höher sie ist, desto länger hält der Teig beim Gehen durch. Sie steht oft auf der Packung (zum Beispiel W 280).",
      name: "W (Chopin-Alveograph)",
      definition: "Gesamtenergie, die n\u00F6tig ist, um eine Teigblase bis zum Platzen aufzubl\u00E4hen. Misst die Mehlst\u00E4rke insgesamt.",
      whyImportant: "W beschreibt die Gesamtstärke des Mehls. Zähigkeit und Dehnbarkeit werden mit P, L und P/L beurteilt: Ein hoher W-Wert allein bedeutet keinen zäheren Teig.",
      ranges: [
        { label: "Schwach", value: "90\u2013160", note: "Kekse, Waffeln" },
        { label: "Mittel", value: "160\u2013200", note: "Kastenwei\u00DFbrot, Focaccia" },
        { label: "Mittelstark", value: "200\u2013280", note: "Neapolitanische Pizza" },
        { label: "Stark", value: "280\u2013350", note: "Brot mit langer G\u00E4rung" },
        { label: "Sehr stark", value: "350\u2013450", note: "Panettone, Croissant" },
      ],
    },
    p_tenacity: {
      plainDefinition: "Wie stark der Teig Widerstand leistet, wenn du daran ziehst.",
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
      plainDefinition: "Wie weit sich der Teig dehnen lässt, bevor er reißt.",
      name: "L (Dehnbarkeit)",
      definition: "Maximale L\u00E4nge, die die Teigblase vor dem Platzen erreicht. Misst, wie weit sich der Teig dehnen l\u00E4sst.",
      whyImportant: "Hoher L: dehnbarer Teig, l\u00E4sst sich ohne Risse ausziehen. Niedriger L: kurzer Teig, rei\u00DFt leicht.",
      ranges: [
        { label: "Pizza", value: "80\u2013120 mm" },
        { label: "Brot", value: "60\u2013100 mm" },
      ],
    },
    pl_ratio: {
      plainDefinition: "Zeigt, ob der Teig eher zurückschnellt (hoher Wert) oder sich leicht dehnen lässt (niedriger Wert).",
      name: "P/L (Verh\u00E4ltnis Z\u00E4higkeit/Dehnbarkeit)",
      definition: "Verhältnis zwischen dem Verformungswiderstand des Teigs und seiner Dehnbarkeit.",
      whyImportant: "Beschreibt das rheologische Gleichgewicht. Der passende Wert hängt von Mehl, Hydration und Methode ab; keine Garantie für Höhe oder Textur.",
      ranges: [
        { label: "Sehr dehnbar · F\u00E4llt leicht zusammen", value: "<0.4", note: "Pinsa" },
        { label: "Dehnbar · Leicht zu verarbeiten", value: "0.4\u20130.5", note: "Klassische Neapolitanische" },
        { label: "Ausgewogen · Gute Balance", value: "0.5\u20130.7", note: "Moderne Neapolitanische, Brot" },
        { label: "Z\u00E4h · Widerstandsf\u00E4hig", value: "0.7\u20131.0", note: "Brot mit langer G\u00E4rung" },
        { label: "Sehr z\u00E4h · Elastisch, zieht sich zur\u00FCck", value: ">1.0", note: "Croissant" },
      ],
    },
    falling_number: {
      plainDefinition: "Zeigt, wie aktiv die Enzyme im Mehl sind, die Stärke in Zucker umwandeln.",
      name: "Falling Number (Hagberg-Perten)",
      definition: "Zeit, die ein R\u00FChrstab braucht, um durch eine erhitzte Mehlsuspension zu fallen. Misst die Amylaseaktivit\u00E4t.",
      whyImportant: "Niedrige FN (<250): schnelle G\u00E4rung, aber instabiler Teig. Hohe FN (>300): stabil f\u00FCr lange Reifung.",
      ranges: [
        { label: "Sehr hohe Amylase · Klebriger Teig", value: "<200", note: "F\u00FCr Pizza nicht empfohlen" },
        { label: "Hoch · Feuchte Krume", value: "200\u2013250", note: "Schnelles Brot" },
        { label: "Mittel · Gute Balance", value: "250\u2013300", note: "Pizza 8-12h" },
        { label: "Niedrig · Trocken, langsam", value: "300\u2013400", note: "Pizza 24-48h" },
        { label: "Sehr niedrig · Trocken", value: ">400", note: "Trockenpasta" },
      ],
    },
    hydration: {
      formula: "H% = (Wassergewicht / Mehlgewicht) × 100",
      plainDefinition: "Wie viel Wasser der Teig im Verhältnis zum Mehl enthält: Bei 65 % kommen auf 100 g Mehl 65 g Wasser.",
      name: "Hydratation (H%)",
      definition: "Gewichtsanteil des Wassers bezogen auf das Mehl im Teig.",
      whyImportant: "Niedrige H (<55%): knusprig, einfach. Mittlere H (60-65%): ausgewogen. Hohe H (>70%): braucht starkes Mehl (W>280) und K\u00F6nnen.",
      ranges: [
        { label: "Klassische Neapolitanische", value: "55\u201360%", note: "Weich, gut zu verarbeiten" },
        { label: "Zeitgen\u00F6ssische Neapolitanische", value: "60\u201365%", note: "Leichter Rand" },
        { label: "Canotto", value: "65\u201370%", note: "Gro\u00DFe Poren" },
        { label: "Pinsa Romana", value: "75\u201385%", note: "Im Blech ausgebreitet" },
        { label: "Focaccia/Bonci", value: "85\u2013100%+", note: "Fast fl\u00FCssig" },
      ],
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
      whyImportant: "Aktivität hängt von Stamm, Menge, Temperatur und Teig ab. Kälte verlangsamt die Fermentation; keine universelle sofortige Stoppgrenze.",
      ranges: [
        { label: "Frischhefe", value: "0.5\u20132.0%", note: "Feuchtigkeit 70%, K\u00FChlschrank 4\u00B0C" },
        { label: "Aktive Trockenhefe", value: "0.3\u20131.0%", note: "Vorher in Wasser aufl\u00F6sen" },
        { label: "Instant-Trockenhefe", value: "0.2\u20130.8%", note: "Direkt ins Mehl" },
      ],
    },
    lab: {
      plainDefinition: "Die Bakterien im Sauerteig, die dem Teig seinen leicht säuerlichen Geschmack geben.",
      name: "LAB (Milchs\u00E4urebakterien)",
      definition: "Bakterien, die Zucker verg\u00E4ren und dabei Milchs\u00E4ure (und Essigs\u00E4ure) bilden. Im Sauerteig enthalten.",
      whyImportant: "Sie können Säure und Fruktane je nach Stämmen, Mehl und Verfahren verändern. Ihre Anwesenheit belegt keine Low-FODMAP-Eignung.",
    },
    q10: {
      plainDefinition: "Um wie viel Mal schneller der Teig geht, wenn es 10 °C wärmer ist.",
      name: "Q\u2081\u2080 (Temperaturkoeffizient)",
      definition: "Faktor, um den sich die Geschwindigkeit einer biochemischen Reaktion pro 10\u00B0C Temperaturanstieg vervielfacht.",
      whyImportant: "Bei Q\u2081\u2080 = 2 verdoppelt sich die G\u00E4rung alle +10\u00B0C: 24h bei 18\u00B0C \u2248 12h bei 28\u00B0C. Die Werte unten sind Sch\u00E4tzungen des {brand}-Modells.",
      ranges: [
        { label: "B\u00E4ckerhefe \u226510\u00B0C", value: "2.0", note: "Modellsch\u00E4tzung, stimmig mit Wachstumsdaten zwischen 18 und 25 \u00B0C" },
        { label: "B\u00E4ckerhefe <10\u00B0C", value: "1.6", note: "Modellsch\u00E4tzung, ohne Quelle" },
        { label: "Sauerteig >15\u00B0C", value: "2.2", note: "Modellsch\u00E4tzung" },
        { label: "Sauerteig \u226415\u00B0C", value: "1.9", note: "Modellsch\u00E4tzung" },
      ],
    },
    arrhenius: {
      name: "Arrhenius-Gleichung",
      definition: "Beschreibt, wie die Reaktionsgeschwindigkeit von der absoluten Temperatur abh\u00E4ngt.",
      whyImportant: "Mit \u03B2=0.075 und T_ref=18\u00B0C \u2192 Q\u2081\u2080 \u2248 2.12. Wird in der {brand}-Engine verwendet, um Hefemenge und Zeiten zu berechnen.",
    },
    biga: {
      name: "Biga",
      definition: "Fester Vorteig aus Mehl, 44 % Wasser (bis 50 % mit Vollkornmehl) und 1 % Hefe, etwa 16 h bei 18–20 °C gereift; die lange Biga braucht 24 h bei 4–5 °C plus 24 h bei 18–20 °C.",
      whyImportant: "Gibt dem Hauptteig Aroma und Struktur. Meist ein Drittel des Gesamtmehls (20–50 %). In der Pizza Napoletana g.t.S. nicht erlaubt, sie wird direkt geführt.",
    },
    poolish: {
      name: "Poolish",
      definition: "Flüssiger Vorteig: Mehl und Wasser zu gleichen Teilen mit wenig Hefe, 12–16 h bei 20–22 °C gereift (0,1 % Hefe für 15–16 h, 0,3 % für 10–12 h).",
      whyImportant: "Reift schnell und macht den Teig dehnbar. Meist 30–50 % des Gesamtmehls. Fertig, wenn die Oberfläche voller Bläschen ist und die Mitte einzusinken beginnt.",
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
      whyImportant: "Stahl (k=50): ideal f\u00FCr Haushalts\u00F6fen mit 280\u00B0C, Backzeit 6-8 min. Stein (k=2): ideal f\u00FCr Holz\u00F6fen mit 450\u00B0C+, Backzeit 60-90s.",
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
      whyImportant: "Elastizität durch Glutenine (S-S-Bindungen), Viskosität durch Gliadine (H-Bindungen). Eine lange Proteolyse macht den Teig dehnbarer, aber das Gluten bleibt: Lange Gare oder Sauerteig machen die Pizza nicht geeignet für Menschen mit Zöliakie. Allergien und Unverträglichkeiten legst du im Profil fest.",
    },
    proteolysis: {
      name: "Proteolyse",
      definition: "Protease-Enzyme zerlegen die Proteine im Teig in kleinere Moleküle wie Peptide und Aminosäuren.",
      whyImportant: "Sie kann Dehnbarkeit und Stabilität des Teigs verändern. Mehl, Mikroorganismen, Temperatur und Verfahren beeinflussen sie: Es gibt keine universelle optimale Dauer und keine Messung der individuellen Verdaulichkeit.",
    },
    thickness_factor: {
      formula: "TF = Teiglingsgewicht (g) / Pizzafläche (cm²)",
      plainDefinition: "Wie viel Teig du pro Quadratzentimeter Pizza brauchst: Je höher der Wert, desto dicker die Pizza.",
      name: "Thickness Factor (TF)",
      definition: "Teigmenge pro Fläche: Gramm Teig je cm² Pizza.",
      whyImportant: "Eine in nordamerikanischen Teigrechnern verbreitete Kennzahl (in oz/in²; 1 oz/in² ≈ 4,39 g/cm²). {brand} gibt sie in g/cm² an, um die Teiglinge zu bemessen; zusammen mit dem Ofen bestimmt sie Backzeit und Knusprigkeit mit.",
      ranges: [
        { label: "Neapolitanische", value: "0.30\u20130.36", note: "6-7 mm" },
        { label: "Tonda Romana", value: "0.20\u20130.25", note: "4-5 mm" },
        { label: "New York", value: "0.40\u20130.50", note: "8-10 mm" },
        { label: "Chicago Deep Dish", value: "1.00\u20131.30", note: "20-26 mm" },
      ],
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
      formula: "T_Wasser = 3 × T_Teig − T_Raum − T_Mehl − Reibung",
      name: "Wassertemperatur (drei Temperaturen)",
      definition: "Berechnet, wie warm das Wasser sein muss, damit der Teig die gew\u00FCnschte Temperatur erreicht.",
      whyImportant: "Summe der drei Temperaturen = 3 \u00D7 gew\u00FCnschter Teig \u2212 Reibung. In Pizzerien hei\u00DFt das auch \u00AB55er-Regel\u00BB: Mit der Summe fest auf 55 liegt der Teig bei etwa 18 \u00B0C (55 \u00F7 3); hier gilt die Zieltemperatur des Stils, 22\u201324 \u00B0C.",
    },
    a_score: {
      formula: "A = 0,35 × Zutaten + 0,30 × Verfahren + 0,35 × Ausstattung",
      name: "A-Score (Authentizit\u00E4t)",
      definition: "Punktzahl von 0 bis 100 für die Nähe zur Stilreferenz. Sie bestätigt keine Konformität mit einem Regelwerk.",
      ranges: [
        { label: "Streng authentisch", value: "90-100" },
        { label: "Weitgehend authentisch", value: "75-89" },
        { label: "Vom Stil inspiriert", value: "60-74" },
        { label: "Deutliche Abweichung", value: "<60" },
      ],
    },
    f_score: {
      formula: "F = 0,4 × Ofen + 0,3 × Mehl + 0,3 × Erfahrung",
      name: "F-Score (Schwierigkeitsgrad)",
      definition: "Punktzahl von 0 bis 100 für die einfache Zubereitung mit vorhandenem Ofen, Mehl und Erfahrung. Ausschlusskriterien werden gesondert geprüft.",
      ranges: [
        { label: "Gut machbar", value: "90-100" },
        { label: "Mit Sorgfalt machbar", value: "75-89" },
        { label: "Schwierig", value: "60-74" },
        { label: "Nicht empfohlen", value: "<60" },
      ],
    },
    d_score: {
      name: "D-Score (Geschätzte Reife)",
      definition: "Modellschätzung anhand von Zeit, Temperatur, Hefe und Vorteigen. Sie misst weder die persönliche Verdaulichkeit noch den FODMAP-Gehalt.",
      ranges: [{ label: "Hoher Index", value: "85-100" },{ label: "Mittelhoher Index", value: "70-84" },{ label: "Mittlerer Index", value: "50-69" },{ label: "Niedriger Index", value: "<50" }],
    },
    /* FW-04: voci del procedimento e delle farine (D-044). */
    dough_division: {
      name: "Teilen (Staglio)",
      definition: "Die Teigmasse in gleich schwere Stücke teilen, eins pro Pizza, und zu Kugeln schließen.",
      whyImportant: "Gleich schwere Teiglinge gehen und backen gleich. Das Gewicht jedes Teiglings steht im Rezept.",
    },
    ball_shaping: {
      name: "Rundwirken (Pirlatura)",
      definition: "Der Handgriff, der ein Teigstück zu einer glatten, straffen Kugel schließt: Du drehst es auf der Arbeitsfläche oder zwischen den Händen, bis die Oberfläche gespannt ist.",
      whyImportant: "Eine gespannte Oberfläche hält das Gas bei der Stückgare und ergibt einen Teigling, der sich rund ausziehen lässt. Reißt der Teig, hast du zu fest gezogen: Lass ihn ein paar Minuten ruhen.",
    },
    gluten_development: {
      name: "Auskneten (Incordatura)",
      definition: "Der Punkt, an dem der Teig glatt und elastisch wird und nicht mehr an Händen oder Schüssel klebt: Das Glutennetz hat sich gebildet.",
      whyImportant: "Ein gut ausgekneteter Teig hält das Gas beim Gehen. Praktische Probe: Zieh ein kleines Stück zwischen den Fingern auseinander; wird es zu einem dünnen Film, ohne sofort zu reißen, ist er fertig. Zu langes Kneten mit der Maschine erwärmt und schwächt den Teig dagegen.",
    },
    folds: {
      name: "Dehnen und Falten",
      definition: "Du ziehst einen Teil des Teigs hoch und faltest ihn über den Rest, drehst die Masse und wiederholst das auf jeder Seite. Das geschieht in Abständen während der Ruhe, statt länger zu kneten.",
      whyImportant: "Es stärkt das Glutennetz, ohne den Teig zu erwärmen, vor allem bei sehr weichen Teigen. „Slap & Fold“ ist eine Variante: Du hebst den Teig an, schlägst ihn auf die Arbeitsfläche und faltest ihn über sich selbst.",
    },
    poke_test: {
      name: "Fingerprobe (Poke-Test)",
      definition: "Drück einen bemehlten Finger etwa einen Zentimeter tief in den Teigling und beobachte, wie die Delle zurückgeht.",
      whyImportant: "Geht die Delle langsam zurück und bleibt eine kleine Spur, ist der Teigling fertig. Geht sie sofort zurück, braucht er noch Zeit. Bleibt sie eingedrückt und fällt der Teigling zusammen, ist er übergärt. Das ist ein praktischer Hinweis, keine Messung.",
    },
    cornicione: {
      name: "Cornicione (Rand)",
      definition: "Der Rand der Pizza, höher und luftiger als die Mitte: Beim Backen dehnt sich das Gas im Teig aus und hebt ihn an.",
      whyImportant: "Dafür schiebst du beim Ausziehen die Luft von der Mitte zum Rand, ohne ihn plattzudrücken. Höhe und Poren hängen von Stil, Hydration, Gare und Ofenhitze ab.",
    },
    oven_floor_dome: {
      name: "Ofenboden und Gewölbe",
      definition: "Der Ofenboden ist die Fläche, auf der die Pizza liegt; das Gewölbe ist die Decke darüber. Der Boden backt die Unterseite durch Kontakt, das Gewölbe backt Belag und Rand mit der abgestrahlten Hitze.",
      whyImportant: "Verbrennt die Unterseite und bleibt der Belag roh, ist der Boden im Verhältnis zum Gewölbe zu heiß; im umgekehrten Fall ist er zu kalt. Im Haushaltsofen übernehmen Stein oder Stahl die Rolle des Bodens und der Grill die des Gewölbes.",
    },
    pre_ferment: {
      name: "Vorteig",
      definition: "Ein Teil von Mehl und Wasser, der Stunden vor dem Hauptteig mit Hefe angesetzt wird und reift. Am häufigsten sind Biga (fest) und Poolish (flüssig).",
      whyImportant: "Er bringt Aroma und verändert, wie sich der Hauptteig verarbeiten lässt. Im Rezept ist er eine eigene Phase, und seine Mengen gehören zur Gesamtmenge: Sie kommen nicht dazu. Die Autolyse ist kein Vorteig, weil sie keine Hefe enthält.",
    },
    sourdough: {
      name: "Sauerteig (Lievito madre)",
      definition: "Ein Teig aus Mehl und Wasser, in dem wilde Hefen und Milchsäurebakterien leben; er wird mit frischem Mehl und Wasser aufgefrischt. Ein Teil davon ersetzt die Backhefe.",
      whyImportant: "Er treibt langsamer als Backhefe und gibt einen leicht säuerlichen Geschmack. Wie aktiv er ist, hängt davon ab, wie du ihn auffrischst: Deshalb ist die Sauerteigmenge eine Annahme des Modells, die du an deinen anpasst.",
    },
    flour_type: {
      name: "Mehltyp (00, 0, 1, 2, Vollkorn)",
      definition: "In Italien gibt der Typ an, wie fein Weichweizenmehl ausgemahlen ist: 00 ist das hellste, dann 0, 1, 2 und Vollkorn, das das ganze Korn enthält. Er richtet sich nach dem Aschegehalt, also den Mineralstoffen, die beim Verbrennen des Mehls zurückbleiben.",
      whyImportant: "Der Typ sagt nicht, wie stark das Mehl ist: Ein 00 kann schwach oder sehr stark sein. Die Stärke ist der W-Wert, falls er auf der Packung steht. Wenn du ihn nicht angibst, nimmt das Modell einen typischen Bereich für diesen Typ an.",
    },
    manitoba: {
      name: "Manitoba",
      definition: "Proteinreiches Weichweizenmehl, ursprünglich aus nordamerikanischem Weizen (der Name stammt von der kanadischen Provinz Manitoba). Heute bezeichnet es im Handel ein sehr starkes Mehl.",
      whyImportant: "Es wird für lange Gare verwendet oder mit einem 00 gemischt, um die Stärke zu erhöhen. Allein ergibt es einen zähen Teig, der sich schwerer ausziehen lässt.",
    },
    semola_rimacinata: {
      name: "Semola rimacinata (doppelt gemahlener Hartweizengrieß)",
      definition: "Hartweizengrieß, der ein zweites Mal gemahlen wurde und feiner ist als normaler Grieß: gelb und leicht körnig.",
      whyImportant: "Man streut ihn auf Arbeitsfläche und Schieber, weil die Pizza darauf gleitet und er weniger verbrennt als Mehl, und in kleinen Mengen in den Teig mancher Stile. Das Gluten von Hartweizen ist weniger dehnbar als das von Weichweizen.",
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
      l2: "Wir multiplizieren die Stunden mit der Geschwindigkeit bei deiner Temperatur. Wenn du kühler als die Referenz gärst (Kühlschrank, Keller), findet die Stückgare bei der Referenztemperatur statt: Diese Stunden zählen so, wie sie sind, und nur die übrigen werden multipliziert. Deshalb geht «Stunden × Geschwindigkeit» allein nicht auf.",
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
  },
  assumptions: {
    "constant-ferment-temp": "Die Temperatur bleibt während der ganzen Phase gleich.",
    "time-exponent-no-source": "Die Korrektur für die Stunden nutzt einen vom Modell gewählten Exponenten, ohne Quelle.",
    "kitchen-temp-standard": "Wenn du die Küchentemperatur nicht angibst, nutzen wir einen Standardwert.",
    "q10-cold-no-source": "Kühl und im Kühlschrank hat der Geschwindigkeitsfaktor keine Quelle: Der Fehler kann groß sein.",
    "proof-share-default": "Ohne Angabe des Stils ist die Stückgare ein fester Anteil der Stunden.",
    "starter-steps-by-hours": "Die Sauerteigmenge sinkt stufenweise mit den Stunden, ohne die Temperatur zu berücksichtigen.",
    "starter-not-in-hydration": "Mehl und Wasser des Sauerteigs zählen nicht zur Hydration.",
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
  },
};
