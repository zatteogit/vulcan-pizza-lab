import { RecipeMatchCard } from "@figma/my-make-file";

// Punteggi reali precalcolati dal motore, congelati come fixture statica.
const scores = {
  "authenticity": 83,
  "feasibility": 60,
  "digestibility": 56,
  "experimentation": 24,
  "sustainability": 66,
  "composite": 69,
  "authenticity_category": "Fedele con adattamenti",
  "feasibility_category": "Difficile",
  "digestibility_category": "Media",
  "experimentation_category": "Variazione parametrica",
  "sustainability_category": "Buona",
  "penalties": [
    {
      "key": "auth.hydrationOff",
      "fallback": "Idratazione fuori centro (-21.8%)",
      "params": {
        "penalty": "21.8"
      }
    },
    {
      "key": "auth.notWoodOven",
      "fallback": "Forno non a legna (-15%)"
    },
    {
      "key": "auth.tempVsIdeal",
      "fallback": "Temperatura {temp} vs {ideal} (-12.1%)",
      "params": {
        "temp": 250,
        "ideal": 485,
        "penalty": "12.1"
      }
    }
  ],
  "warnings": [
    {
      "key": "feas.ovenTooCold",
      "fallback": "Forno troppo freddo: {temp} < minimo {min}",
      "params": {
        "temp": 250,
        "min": 430
      }
    }
  ],
  "claims": [
    {
      "key": "dig.coldFermentation",
      "fallback": "Fermentazione fredda: attività enzimatica ottimale"
    },
    {
      "key": "sust.pureDough",
      "fallback": "Impasto puro: solo farina, acqua, sale, lievito"
    }
  ]
} as any;

export function Adapted() {
  return (
    <div style={{ maxWidth: 420 }}>
      <RecipeMatchCard scores={scores} ovenTemp={250} idealTemp={430} minTemp={250} />
    </div>
  );
}
