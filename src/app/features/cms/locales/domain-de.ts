/* === DOMAIN DATA i18n — Deutsch === */
import type {
  CmsPreFerment,
  CmsDietaryI18n,
  CmsTroubleshootingI18n,
  CmsGlossaryTerms,
} from "../cms-context";

export const PRE_FERMENT_DE: Partial<CmsPreFerment> = {
  sectionLabel: "Vorteig",
  tipsLabel: "Tipps",
  showComparison: "Biga vs Poolish vs Autolyse vergleichen",
  hideComparison: "Vergleich ausblenden",
  paramHydration: "Hydratation",
  paramDuration: "Dauer",
  paramTemperature: "Temperatur",
  paramPh: "End-pH",
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
    "End-pH",
    "Geschmack",
    "Dehnbarkeit",
    "Porung",
    "Komplexit\u00E4t",
  ],
  items: {
    poolish: {
      origin: "Franz\u00F6sisch",
      description:
        "Fl\u00FCssiger Vorteig (1:1 Mehl:Wasser) mit vorwiegend alkoholischer G\u00E4rung. Entwickelt Zucker f\u00FCr intensive Maillard-Reaktion.",
      hydration: "100% (1:1-Verh\u00E4ltnis)",
      consistency: "Fl\u00FCssig, schaumig",
      fermentationType:
        "Vorwiegend alkoholisch (CO\u2082 + Ethanol)",
      flavor: "S\u00FC\u00DF, malzig, komplexe Noten",
      crustResult:
        "Leicht, intensiv golden, ausgepr\u00E4gtes Leopardenmuster",
      extensibility: "Hoch \u2014 einfach zu dehnen",
      idealStyles:
        "Teglia Romana, NY Style, Zeitgen\u00F6ssische Neapolitanische, Focaccia",
      tips: [
        "Optimaler Punkt: gew\u00F6lbte Oberfl\u00E4che mit Blasen, beginnt sich zur\u00FCckzuziehen",
        "Nach 16h wird der Geschmack zu sauer/alkoholisch",
        "Wenn er zusammenf\u00E4llt, noch verwendbar \u2014 Anteil reduzieren",
        "Poolish-Anteil am Endteig: 20-40% des Gesamtmehls",
      ],
    },
    biga: {
      origin: "Italienisch",
      description:
        "Fester Vorteig (44-48% Hydratation) mit Milchs\u00E4ure- + alkoholischer G\u00E4rung. Maximale Haltbarkeit und Aromakomplexität.",
      hydration: "44-48%",
      consistency: "Trocken, kompakt",
      fermentationType:
        "Milchs\u00E4ure + alkoholisch (aktive LAB)",
      flavor: "S\u00E4uerlich, komplex, fermentierte Noten",
      crustResult: "Knusprig, br\u00FCchig, feine Porung",
      extensibility:
        "Niedrig \u2014 Ruhezeit nach Portionierung n\u00F6tig",
      idealStyles:
        "Klassische Neapolitanische, Pinsa, Pizza al taglio, Brot",
      tips: [
        "Wenn zu trocken: 5-10% Wasser hinzuf\u00FCgen",
        'Reif wenn Oberfl\u00E4che rissig "gew\u00F6lbt" und Volumen verdreifacht',
        "Bis zu 48h im K\u00FChlschrank haltbar (vor Gebrauch mit 10% Wasser auffrischen)",
        "Biga-Anteil am Endteig: 20-50% des Gesamtmehls",
      ],
    },
    autolisi: {
      origin: "Universal",
      description:
        "Enzymatische Ruhezeit von Mehl+Wasser (ohne Hefe/Salz). Entwickelt Gluten spontan und aktiviert Protease/Amylase.",
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
        "Vollkornmehl: l\u00E4ngere Autolyse (60-90min)",
        "Warmes Wasser (30-35\u00B0C) beschleunigt Enzyme",
        "IMMER vor Salzzugabe (Salz hemmt Enzyme)",
        "Reduziert Knetzeit um 30%",
        "Kombinierbar mit Biga oder Poolish",
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
      autolisi: "Raumtemp.",
    },
    ph: {
      biga: "5.0-5.3",
      poolish: "4.5-4.8",
      autolisi: "~6.5",
    },
    flavor: {
      biga: "S\u00E4uerlich",
      poolish: "S\u00FC\u00DF/malzig",
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

export const DIETARY_DE: Partial<CmsDietaryI18n> = {
  info: {
    low_fodmap: {
      name: "Low FODMAP",
      description:
        "Reduziert fermentierbare Fruktane und Oligosaccharide",
      scienceNote:
        "G\u00E4rung \u226524h reduziert FODMAP 70% (Costabile 2014)",
    },
    histamine: {
      name: "Histaminarm",
      description:
        "Begrenzt Histaminaufbau durch lange G\u00E4rung",
      scienceNote:
        "Histamin akkumuliert linear. Frischhefe <6h: sicher (<5 mg/kg)",
    },
    gluten_free: {
      name: "Glutenfrei",
      description:
        "F\u00FCr Z\u00F6liakie oder Glutensensitivit\u00E4t",
      scienceNote:
        "EU-Schwelle: <20 ppm. Erfordert GF-Mix (Reis/Mais/Quinoa + Xanthan 1.5%)",
    },
    lactose_free: {
      name: "Laktosefrei",
      description: "Bei Laktoseintoleranz",
      scienceNote:
        "Backen >200\u00B0C baut 90%+ Laktose ab. Nur SCHWER erfordert Ersatz",
    },
    nickel: {
      name: "Nickelarm",
      description: "Bei systemischer Nickelallergie (SNAS)",
      scienceNote:
        "Mehl 00 (~50 \u00B5g/100g) vs Vollkorn (~200 \u00B5g/100g). Schwelle <200 \u00B5g/Tag",
    },
    vegan: {
      name: "Vegan",
      description: "Keine tierischen Produkte",
      scienceNote:
        "Grundteig ist bereits vegan. Achtung bei Belag und Fetten (Butter \u2192 \u00D6l)",
    },
  },
  conflicts: {
    fodmap_histamine: {
      message:
        "FODMAP erfordert lange G\u00E4rung (\u226524h), Histamin erfordert kurze G\u00E4rung (\u226412h)",
      compromiseTip:
        "Kompromiss: 8-12h mit Frischhefe bei 18\u00B0C. FODMAP reduziert ~40% (suboptimal), Histamin ~8 mg/kg (akzeptabel)",
    },
    gf_fodmap: {
      message:
        "Kompatibel! GF-Mix eliminiert die Hauptquelle von FODMAP (Weizenfruktane)",
    },
    nickel_general: {
      message:
        "F\u00FCr nickelarm Mehl 00 (50 \u00B5g/100g) statt Vollkorn (200 \u00B5g/100g) bevorzugen",
    },
  },
  warnings: {
    fodmap_low: {
      message:
        "FODMAP nur {pct}% reduziert \u2014 G\u00E4rung zu kurz",
      tip: "Auf \u226524h erh\u00F6hen f\u00FCr 70%+ Reduktion",
    },
    fodmap_good: {
      message:
        "FODMAP {pct}% reduziert \u2014 gutes Niveau f\u00FCr RDS",
      tip: "Die G\u00E4rung ist lang genug um Fruktane abzubauen",
    },
    histamine_high: {
      message:
        "Gesch\u00E4tztes Histamin ~{val} mg/kg \u2014 hohes Niveau",
      tip: "G\u00E4rung auf \u226412h reduzieren oder Frischhefe bei \u226420\u00B0C verwenden",
    },
    histamine_moderate: {
      message:
        "Gesch\u00E4tztes Histamin ~{val} mg/kg \u2014 m\u00E4\u00DFiges Niveau",
      tip: "Symptome beobachten. Sicherheitshalber Zeit oder Temperatur reduzieren",
    },
    gluten_free: {
      message:
        "Rezept verwendet Weizenmehl \u2014 unvertr\u00E4glich bei Z\u00F6liakie",
      tip: "Ersetzen mit GF-Mix (Reis 40% + Mais 30% + Quinoa 10% + Sorghum 10% + St\u00E4rke 10%) + Xanthan 1.5%",
    },
    nickel_highW: {
      message:
        "Starke Mehle (hoher W) sind weniger raffiniert, mit mehr Nickel",
      tip: "Raffiniertes Mehl 00 (W 200-260) bevorzugen um Nickel zu minimieren",
    },
  },
};

export const TROUBLESHOOTING_DE: Partial<CmsTroubleshootingI18n> =
  {
    categories: {
      dough: "Teig",
      fermentation: "G\u00E4rung",
      shaping: "Formen",
      baking: "Backen",
      solver: "Algorithmus",
      false_positive: "Fehlalarme",
    },
    issues: {
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
          "Sofort auf 4\u00B0C umstellen um G\u00E4rung zu stoppen",
        prevention:
          "0.2% Frischhefe f\u00FCr 24h, Temperatur kontrollieren",
      },
      P06: {
        symptom: "Zu saurer/essigartiger Geschmack",
        cause:
          "Heterofermentative LAB aktiv >48h bei >18\u00B0C (besonders mit Sauerteig)",
        testRapido:
          "Teig-pH \u2014 sollte 4.5-5.5 sein, problematisch wenn <4.2",
        fixImmediate:
          "0.5-1% Zucker hinzuf\u00FCgen um S\u00E4ure zu maskieren",
        prevention: "G\u00E4rungen >24h immer bei 4-8\u00B0C",
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
          "0.5-1% Zucker hinzuf\u00FCgen, Ofen mindestens 280\u00B0C",
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
        prevention: "Boncis Tipp für zu Hause: 0,5–1 % Zucker gibt der Hefe sofort Nahrung und macht die Gärung berechenbarer, wenn der Kühlschrank schwankt. Nur bei Stilen, die Zusätze erlauben — nie bei Napoletana STG/AVPN nach Regelwerk",
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
          "Kurze G\u00E4rung ({h}h): blasse Kruste und begrenzte Verdaulichkeit",
        tip: "0.5-1% Zucker f\u00FCr Maillard-Br\u00E4unung hinzuf\u00FCgen",
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
      whyImportant: "Niedriger W (<180): dehnbarer Teig, kurze G\u00E4rung. Mittlerer W (220-280): ideal f\u00FCr Neapolitanische, vertr\u00E4gt 18-30h. Hoher W (>300): z\u00E4her Teig, n\u00F6tig f\u00FCr reichhaltige Teige.",
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
      definition: "Kennzahl f\u00FCr das mechanische Gleichgewicht. Verh\u00E4ltnis zwischen Widerstand und Dehnbarkeit des Teigs.",
      whyImportant: "Optimaler P/L (0.5-0.6): hoher Rand + d\u00FCnner Boden. <0.4: flache Pizza. >0.8: \u201Egummiartiger\u201C Teig.",
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
      definition: "Zeitspanne, in der der Teig beim Kneten die optimale Konsistenz beh\u00E4lt. Gemessen mit dem Farinographen.",
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
      definition: "Einzelliger Pilz, der Zucker in CO\u2082 + Ethanol + Aromastoffe umwandelt.",
      whyImportant: "Optimale Temp.: 28-32\u00B0C. Min. 4\u00B0C (ruhend). Max. 40\u00B0C (gehemmt). Abt\u00F6tung >55\u00B0C.",
      ranges: [
        { label: "Frischhefe", value: "0.5\u20132.0%", note: "Feuchtigkeit 70%, K\u00FChlschrank 4\u00B0C" },
        { label: "Aktive Trockenhefe", value: "0.3\u20131.0%", note: "Vorher in Wasser aufl\u00F6sen" },
        { label: "Instant-Trockenhefe", value: "0.2\u20130.8%", note: "Direkt ins Mehl" },
      ],
    },
    lab: {
      name: "LAB (Milchs\u00E4urebakterien)",
      definition: "Bakterien, die Zucker verg\u00E4ren und dabei Milchs\u00E4ure (und Essigs\u00E4ure) bilden. Im Sauerteig enthalten.",
      whyImportant: "Senken den pH (4.0-4.5), erh\u00F6hen die S\u00E4ure, bauen FODMAP (Fruktane) ab, hemmen Schimmel. Optimale Temp.: 28-32\u00B0C.",
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
      definition: "Fester Vorteig (44-50% Hydratation) aus Mehl + Wasser + Hefe, 16-24h bei 16-18\u00B0C geg\u00E4rt.",
      whyImportant: "Bringt mehr Teigkraft, Dehnbarkeit und komplexen Geschmack, eine rustikal unregelm\u00E4\u00DFige Porung und l\u00E4ngere Haltbarkeit. Anteil: 20-40% des Gesamtmehls.",
    },
    poolish: {
      name: "Poolish",
      definition: "Fl\u00FCssiger Vorteig (100% Hydratation) aus Mehl + Wasser 1:1 + Hefe, 12-16h bei 16-18\u00B0C geg\u00E4rt.",
      whyImportant: "Hohe Dehnbarkeit, feine gleichm\u00E4\u00DFige Porung, s\u00FC\u00DFlich-s\u00E4uerlicher Geschmack, d\u00FCnne knusprige Kruste. Poolish = Dehnbarkeit; Biga = Teigkraft.",
    },
    autolysis: {
      name: "Autolyse",
      definition: "Ruhezeit von Mehl + Wasser (ohne Hefe/Salz) f\u00FCr 20-60 min. Protease-Enzyme entwickeln das Gluten von selbst.",
      whyImportant: "Knetzeit -30-50%, mehr Dehnbarkeit, bessere Hydratation. 20-30 min bei W<200, 45-60 min bei W>280.",
    },
    bulk_fermentation: {
      name: "Stockgare (Bulk Fermentation)",
      definition: "Erste G\u00E4rphase nach dem Kneten, vor dem Teilen in Teiglinge. Der Teig ruht 30 min \u2013 4h als ein St\u00FCck.",
      whyImportant: "Entspannung des Glutens, Beginn der G\u00E4rung, Aromaentwicklung, Volumenzunahme um 20-50%.",
    },
    ball_fermentation: {
      name: "St\u00FCckgare (Ball Fermentation)",
      definition: "Zweite G\u00E4rphase nach dem Teilen in Teiglinge. Jeder Teigling ruht einzeln 4-48h bei 4-22\u00B0C.",
      whyImportant: "Hauptg\u00E4rung, Reifung durch Proteolyse, Entwicklung des Endvolumens, Stabilisierung des pH.",
    },
    maillard: {
      name: "Maillard-Reaktion",
      definition: "Nicht-enzymatische Reaktion zwischen Aminos\u00E4uren und reduzierenden Zuckern bei hoher Temperatur (>140\u00B0C).",
      whyImportant: "Goldene Kruste (Melanoidine), R\u00F6staroma (Pyrazine), Leopardenflecken ab 300\u00B0C+. Optimal 160-180\u00B0C.",
    },
    caramelization: {
      name: "Karamellisierung",
      definition: "Thermischer Abbau von Zucker (ohne Proteine) bei hoher Temperatur (>150\u00B0C Saccharose, >120\u00B0C Fruktose).",
      whyImportant: "Tr\u00E4gt zu dunklen Flecken am Rand bei. Bei Pizza weniger relevant als Maillard (wenig Proteine an der Oberfl\u00E4che).",
    },
    starch_gelatinization: {
      name: "St\u00E4rkeverkleisterung",
      definition: "\u00DCbergang der St\u00E4rke vom kristallinen in den gelartigen Zustand unter Wasseraufnahme. Beginn 55-60\u00B0C, H\u00F6hepunkt 65-70\u00B0C, abgeschlossen 80-85\u00B0C.",
      whyImportant: "Krume: macht St\u00E4rke verdaulich (<55\u00B0C im Kern = rohe St\u00E4rke). Kruste: >100\u00B0C \u2192 knusprig.",
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
      whyImportant: "Der Darm verdaut Fruktane nicht \u2192 Bakterien verg\u00E4ren sie \u2192 Gase/Bl\u00E4hungen. Lange G\u00E4rung reduziert sie: 24h\u219260-70%, 48h\u219280-85%.",
    },
    histamine: {
      name: "Histamin",
      definition: "Biogenes Amin aus der Decarboxylierung von Histidin. Wird von LAB w\u00E4hrend der G\u00E4rung gebildet und kommt in gereiftem K\u00E4se und Wurstwaren vor.",
      whyImportant: "Reichert sich linear mit der Zeit an. Sauerteig 24h/28\u00B0C \u2192 30-50 mg/kg. Bei DAO-Mangel: pseudoallergische Reaktion. L\u00F6sung: kurze G\u00E4rung (<12h) + B\u00E4ckerhefe.",
    },
    gluten: {
      name: "Gluten",
      definition: "Viskoelastischer Proteinkomplex aus Gliadin (dehnbar) + Glutenin (z\u00E4h), der mit Wasser und durch Kneten entsteht.",
      whyImportant: "Elastizit\u00E4t durch Glutenine (S-S-Bindungen), Viskosit\u00E4t durch Gliadine (H-Bindungen). Lange Proteolyse spaltet Bindungen \u2192 dehnbarerer Teig.",
    },
    proteolysis: {
      name: "Proteolyse",
      definition: "Abbau von Proteinen zu Peptiden und Aminos\u00E4uren durch Protease-Enzyme. Ziel: Gluten.",
      whyImportant: "Leichteres Ausziehen, bessere Bek\u00F6mmlichkeit, freie Aminos\u00E4uren \u2192 Umami-Geschmack. Zu viel (>72h): Teig zu weich. Optimal: 24-48h.",
    },
    thickness_factor: {
      name: "Thickness Factor (TF)",
      definition: "Fl\u00E4chendichte des Teigs \u2014 Masse pro Fl\u00E4cheneinheit. Gibt an, wie viel Teig auf einen cm\u00B2 kommt.",
      whyImportant: "Bestimmt Backzeit, Knusprigkeit und Kaloriendichte. Eigene Kennzahl des Projekts {brand}.",
      ranges: [
        { label: "Neapolitanische", value: "0.30\u20130.36", note: "6-7 mm" },
        { label: "Tonda Romana", value: "0.20\u20130.25", note: "4-5 mm" },
        { label: "New York", value: "0.40\u20130.50", note: "8-10 mm" },
        { label: "Chicago Deep Dish", value: "1.00\u20131.30", note: "20-26 mm" },
      ],
    },
    friction_factor: {
      name: "Friction Factor (Reibungsfaktor)",
      definition: "Anstieg der Teigtemperatur (\u00B0C) pro Knetminute durch mechanische Reibung.",
      whyImportant: "Kneten erzeugt W\u00E4rme \u2192 die Temperatur steigt \u2192 die G\u00E4rung l\u00E4uft zu schnell. Wird in der 55er-Regel verwendet.",
      ranges: [
        { label: "Von Hand", value: "0.0" },
        { label: "Haushalts-K\u00FCchenmaschine", value: "0.8\u20131.0" },
        { label: "Profi-Spiralkneter", value: "0.4\u20130.6" },
        { label: "Gabelkneter", value: "0.2\u20130.3" },
      ],
    },
    rule_of_55: {
      name: "55er-Regel",
      definition: "Faustformel f\u00FCr die Wassertemperatur, mit der du die gew\u00FCnschte Teigtemperatur erreichst.",
      whyImportant: "55 = empirische Konstante (je nach Maschine 50-60). \u0394T_Reibung = Friction Factor \u00D7 Knetzeit.",
    },
    a_score: {
      name: "A-Score (Authentizit\u00E4t)",
      definition: "Wert von 0-100, der misst, wie genau ein Rezept dem Regelwerk des Zielstils folgt.",
      ranges: [
        { label: "90-100", value: "Streng authentisch" },
        { label: "75-89", value: "Weitgehend authentisch" },
        { label: "60-74", value: "Vom Stil inspiriert" },
        { label: "<60", value: "Deutliche Abweichung" },
      ],
    },
    f_score: {
      name: "F-Score (Machbarkeit)",
      definition: "Wert von 0-100, der die praktische Umsetzbarkeit bei gegebener Ausstattung und Erfahrung misst.",
      ranges: [
        { label: "90-100", value: "Gut machbar" },
        { label: "75-89", value: "Mit Sorgfalt machbar" },
        { label: "60-74", value: "Schwierig" },
        { label: "<60", value: "Nicht empfohlen" },
      ],
    },
    d_score: {
      name: "D-Score (Bek\u00F6mmlichkeit)",
      definition: "Wert von 0-100, der die Bek\u00F6mmlichkeit anhand normalisierter G\u00E4rstunden und der FODMAP-Reduktion sch\u00E4tzt.",
      ranges: [
        { label: "85-100", value: "Hoch (>48h \u00E4quivalent)" },
        { label: "70-84", value: "Mittel bis hoch (24-48h)" },
        { label: "50-69", value: "Mittel (12-24h)" },
        { label: "<50", value: "Niedrig (<12h)" },
      ],
    },
  },
};