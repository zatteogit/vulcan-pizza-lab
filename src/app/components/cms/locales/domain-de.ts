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
  terms: {},
};