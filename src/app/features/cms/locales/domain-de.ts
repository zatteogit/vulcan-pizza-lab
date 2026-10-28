/* === DOMAIN DATA i18n — Deutsch === */
import type {
  CmsPreFerment,
  CmsTroubleshootingI18n,
  CmsGlossaryTerms,
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
    "Porung",
    "Komplexität",
  ],
  items: {
    poolish: {
      origin: "Franz\u00F6sisch",
      description:
        "Flüssiger Vorteig: Mehl und Wasser zu gleichen Teilen mit wenig Hefe, 12–16 h bei 20–22 °C.",
      hydration: "100 % (Mehl und Wasser zu gleichen Teilen)",
      consistency: "Fl\u00FCssig, schaumig",
      fermentationType:
        "Schnell: mit viel Wasser reift er in wenigen Stunden",
      flavor: "Leicht säuerlich, nussige Noten",
      crustResult:
        "Leicht, intensiv golden, ausgepr\u00E4gtes Leopardenmuster",
      extensibility: "Hoch \u2014 einfach zu dehnen",
      idealStyles:
        "Teglia Romana, NY Style, Zeitgen\u00F6ssische Neapolitanische, Focaccia",
      tips: [
        "Fertig, wenn die Oberfläche voller Bläschen ist und die Mitte einzusinken beginnt",
        "Mehr Hefe, weniger Stunden: bei 20–22 °C 0,1 % für 15–16 h, 0,3 % für 10–12 h",
        "Mehl im Poolish: 30–50 % des Gesamtmehls",
      ],
    },
    biga: {
      origin: "Italienisch",
      description:
        "Fester Vorteig: Mehl, 44 % Wasser und 1 % Hefe, etwa 16 h bei 18–20 °C.",
      hydration: "44 % (bis 50 % mit Vollkornmehl)",
      consistency: "Trocken, kompakt",
      fermentationType:
        "Langsam: mit wenig Wasser reift sie in 16–48 h",
      flavor: "Aromatisch, blumig",
      crustResult: "Knusprig, br\u00FCchig, feine Porung",
      extensibility:
        "Niedrig \u2014 Ruhezeit nach Portionierung n\u00F6tig",
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
      origin: "Frankreich (R. Calvel, 1974)",
      description:
        "Kein Vorteig: Mehl und Wasser ruhen ohne Hefe und Salz vor dem Kneten.",
      hydration: "55-75% (gesamtes Rezeptwasser)",
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
      autolisi: "55-75%",
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
      biga: "Niedrig",
      poolish: "Hoch",
      autolisi: "Hoch",
    },
    alveolatura: {
      biga: "Fein",
      poolish: "Gro\u00DF",
      autolisi: "Gro\u00DF",
    },
    complexity: {
      biga: "Mittel",
      poolish: "Niedrig",
      autolisi: "Sehr niedrig",
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
          "Kontakt mit Ofengew\u00F6lbe >500\u00B0C \u2014 lokalisierte Maillard-Reaktion",
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
      whyImportant: "Beschreibt das rheologische Gleichgewicht. Der passende Wert hängt von Mehl, Hydration und Methode ab; keine Garantie für Höhe oder Textur.",
      ranges: [
        { label: "<0.4 Sehr dehnbar", value: "F\u00E4llt leicht zusammen", note: "Pinsa" },
        { label: "0.4\u20130.5 Dehnbar", value: "Leicht zu verarbeiten", note: "Klassische Neapolitanische" },
        { label: "0.5\u20130.7 Ausgewogen", value: "Gute Balance", note: "Moderne Neapolitanische, Brot" },
        { label: "0.7\u20131.0 Z\u00E4h", value: "Widerstandsf\u00E4hig", note: "Brot mit langer G\u00E4rung" },
        { label: ">1.0 Sehr z\u00E4h", value: "Elastisch, zieht sich zur\u00FCck", note: "Croissant" },
      ],
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
      name: "LAB (Milchs\u00E4urebakterien)",
      definition: "Bakterien, die Zucker verg\u00E4ren und dabei Milchs\u00E4ure (und Essigs\u00E4ure) bilden. Im Sauerteig enthalten.",
      whyImportant: "Sie können Säure und Fruktane je nach Stämmen, Mehl und Verfahren verändern. Ihre Anwesenheit belegt keine Low-FODMAP-Eignung.",
    },
    q10: {
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
      whyImportant: "Bestimmt Backzeit, Knusprigkeit und Kaloriendichte. Eigene Kennzahl des Projekts {brand}.",
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
      name: "Wassertemperatur (drei Temperaturen)",
      definition: "Berechnet, wie warm das Wasser sein muss, damit der Teig die gew\u00FCnschte Temperatur erreicht.",
      whyImportant: "Summe der drei Temperaturen = 3 \u00D7 gew\u00FCnschter Teig \u2212 Reibung. In Pizzerien hei\u00DFt das auch \u00AB55er-Regel\u00BB: Mit der Summe fest auf 55 liegt der Teig bei etwa 18 \u00B0C (55 \u00F7 3); hier gilt die Zieltemperatur des Stils, 22\u201324 \u00B0C.",
    },
    a_score: {
      name: "A-Score (Authentizit\u00E4t)",
      definition: "Punktzahl von 0 bis 100 für die Nähe zur Stilreferenz. Sie bestätigt keine Konformität mit einem Regelwerk.",
      ranges: [
        { label: "90-100", value: "Streng authentisch" },
        { label: "75-89", value: "Weitgehend authentisch" },
        { label: "60-74", value: "Vom Stil inspiriert" },
        { label: "<60", value: "Deutliche Abweichung" },
      ],
    },
    f_score: {
      name: "F-Score (Schwierigkeitsgrad)",
      definition: "Punktzahl von 0 bis 100 für die einfache Zubereitung mit vorhandenem Ofen, Mehl und Erfahrung. Ausschlusskriterien werden gesondert geprüft.",
      ranges: [
        { label: "90-100", value: "Gut machbar" },
        { label: "75-89", value: "Mit Sorgfalt machbar" },
        { label: "60-74", value: "Schwierig" },
        { label: "<60", value: "Nicht empfohlen" },
      ],
    },
    d_score: {
      name: "D-Score (Geschätzte Reife)",
      definition: "Modellschätzung anhand von Zeit, Temperatur, Hefe und Vorteigen. Sie misst weder die persönliche Verdaulichkeit noch den FODMAP-Gehalt.",
      ranges: [{"label":"85-100","value":"Hoher Index"},{"label":"70-84","value":"Mittelhoher Index"},{"label":"50-69","value":"Mittlerer Index"},{"label":"<50","value":"Niedriger Index"}],
    },
  },
};