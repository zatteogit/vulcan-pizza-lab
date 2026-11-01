import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LearningIllustration, type LearningIllustrationId } from "./learning-illustration";

const render = (id: LearningIllustrationId) => renderToStaticMarkup(createElement(LearningIllustration, { id }));

describe("learning credits distinguish inspiration from attribution and evidence", () => {
  it("keeps useful captions without publishing photographic inspiration", () => {
    for (const id of ["bench-fold", "autolyse-initial-mix", "farinograph-bowl", "room-air-temperature", "fridge-shelf-temperature", "flour-temperature", "yeast-freshness-check", "dough-volume-comparison"] as const) {
      const html = render(id);
      expect(html).toContain("<figcaption><p>");
      expect(html).not.toContain('data-region="learning-source"');
      expect(html).not.toContain("https://");
    }
  });

  it("preserves the credits of declared licensed adaptations", () => {
    for (const id of ["biga", "poolish", "whole-wheat", "preferment-pair", "lactic-bacteria"] as const) {
      const html = render(id);
      expect(html).toContain("creativecommons.org/licenses/");
      expect(html).toContain('data-region="learning-source"');
    }
    expect(render("lactic-bacteria")).toContain("Dr. Horst Neve / Max Rubner-Institut");
    expect(render("lactic-bacteria")).toContain("by-sa/3.0");
  });

  it("retains scientific and engine sources independently of photo inspiration", () => {
    expect(render("fermented-salami")).toContain("https://www.efsa.europa.eu/en/efsajournal/pub/2393");
    expect(render("fermented-salami")).not.toContain("salamecacciatore.it");
    expect(render("arrhenius")).toContain("https://goldbook.iupac.org/terms/view/A00446");
    const aScore = render("a_score");
    expect(aScore).toContain("https://github.com/zatteogit/vulcan-pizza-lab/");
    expect(aScore).not.toContain("molinomagri.com");
    expect(aScore).not.toContain("kingarthurbaking.com");
    expect(render("d_score")).toContain("creativecommons.org/licenses/by/2.0");
  });
});
