import { RecipeStatStrip } from "@figma/my-make-file";

// Ricetta reale precalcolata dal motore (generateRecipe) e congelata come
// fixture statica — così il motore NON entra nel bundle del DS.
const recipe = {
  "cook_time_sec": 345,
  "fermentation_hours": 16,
  "fermentation_temp_c": 4,
  "flour_pl": 0.55,
  "flour_w": 285,
  "hydration_pct": 67.2,
  "oven_temp_c": 250,
  "science": {
    "yeast_baker_pct": 0.26,
    "effective_hours_18c": 8.3,
    "fodmap_reduction_pct": null,
    "gluten_network": 63,
    "proteolysis_index": 27,
    "water_activity": 0.951,
    "starch_degradation_pct": 20,
    "q10_factor": 0.52,
    "q10_model": "cold_adapted",
    "authenticity_breakdown": {
      "ingredienti": 78.25,
      "processo": 100,
      "attrezzatura": 72.88659793814433
    },
    "compensations": [
      {
        "type": "hydration",
        "original": 0,
        "compensated": 8.7,
        "reason": "+8.7% idratazione per compensare deficit 235°C (modello logaritmico)"
      },
      {
        "type": "cook_time",
        "original": 75,
        "compensated": 345,
        "reason": "Tempo cottura da 75s a 6min (modello esponenziale)"
      },
      {
        "type": "thickness",
        "original": 1,
        "compensated": 0.8,
        "reason": "Stendere -20% più sottile per cottura uniforme con forno domestico"
      }
    ],
    "flour_pl_estimated": 0.55,
    "baking_energy_kj": 690,
    "desired_dough_temp_c": 22,
    "friction_factor": 0,
    "water_temp_c": 24,
    "deviation_category": "canonical",
    "deviation_score_intrinsic": 0,
    "deviation_score_effective": 0.25,
    "compensation_deviation_points": [
      "dough_composition",
      "baking_medium",
      "dough_structure"
    ]
  },
  "scores": {
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
  },
  "style": {
    "baking": {
      "oven_type_required": "wood",
      "temp_c_range": [
        430,
        500
      ],
      "temp_c_ideal": 485,
      "cook_time_sec_range": [
        60,
        90
      ],
      "cook_time_sec_ideal": 75
    },
    "dough": {
      "flour_w_range": [
        250,
        320
      ],
      "flour_pl_range": [
        0.55,
        0.7
      ],
      "hydration_pct_range": [
        55,
        62
      ],
      "salt_pct": 2.5,
      "oil_pct": 0,
      "fat_type": "none",
      "sugar_pct": 0,
      "fermentation_hours_range": [
        8,
        24
      ],
      "process_type": "direct"
    },
    "name": "Napoletana STG"
  }
} as any;

export function Standard() {
  return (
    <div style={{ maxWidth: 500 }}>
      <RecipeStatStrip recipe={recipe} />
    </div>
  );
}

export function Nerd() {
  return (
    <div style={{ maxWidth: 500 }}>
      <RecipeStatStrip recipe={recipe} nerdAvailable nerdMode />
    </div>
  );
}
