import { describe, expect, it } from "vitest";
import { STYLES_DB, doughThicknessGPerCm2 } from "../domain/pizza-engine";
import { getStyleParametrics } from "./parametric-databases";

/* Audit n. 11 (B-15, B-16): la scheda tecnica di uno stile leggeva peso,
   sale, forno e tempi da questo archivio, diversi dal motore (Pala 350 g
   nella scheda, 320 g nella ricetta). Il motore è la fonte: qui si verifica
   che i numeri coincidano. */

describe("archivio parametrico allineato al motore", () => {
  for (const style of Object.values(STYLES_DB)) {
    it(style.id, () => {
      const p = getStyleParametrics(style.id);
      if (p.doughBase) expect(p.doughBase.ballWeight_g).toBe(style.shape.dough_weight_g);
      if (p.salt) expect(p.salt.saltPct).toBe(style.dough.salt_pct);
      if (p.ovenTemp) {
        expect([p.ovenTemp.idealTemp_c, p.ovenTemp.minTemp_c, p.ovenTemp.maxTemp_c]).toEqual([
          style.baking.temp_c_ideal,
          ...style.baking.temp_c_range,
        ]);
      }
      if (p.bakingTime) {
        expect([p.bakingTime.idealSeconds, p.bakingTime.minSeconds, p.bakingTime.maxSeconds]).toEqual([
          style.baking.cook_time_sec_ideal,
          ...style.baking.cook_time_sec_range,
        ]);
      }
    });
  }
});

describe("spessore in g/cm²", () => {
  it("è il peso sull'area della forma", () => {
    const pala = STYLES_DB.pala_romana;
    const area = Math.PI * (pala.shape.length_cm! / 2) * (pala.shape.width_cm! / 2);
    expect(doughThicknessGPerCm2(pala)).toBeCloseTo(pala.shape.dough_weight_g / area, 2);
  });
});
