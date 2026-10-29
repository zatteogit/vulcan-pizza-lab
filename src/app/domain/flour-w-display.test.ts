import { describe, expect, it } from "vitest";
import { flourWText } from "./flour-w-display";

describe("flourWText (D-060)", () => {
  it("mostra l'intervallo dello stile quando la W ci sta dentro", () => {
    expect(flourWText(285, [260, 310])).toBe("260–310");
    expect(flourWText(260, [260, 310])).toBe("260–310");
  });
  it("fuori dall'intervallo arrotonda alla decina", () => {
    expect(flourWText(347, [260, 310])).toBe("350");
    expect(flourWText(284, undefined)).toBe("280");
  });
  it("un intervallo degenere non diventa «300–300»", () => {
    expect(flourWText(300, [300, 300])).toBe("300");
  });
});
