import { describe, expect, it } from "vitest";
import { reminderStatus, truncateAtWord } from "./cook-reminders";
import { migrateEquipment } from "../../data/equipment-data";

describe("FW-16 · promemoria della pizzata", () => {
  it("accorcia sul confine di parola con i puntini", () => {
    expect(truncateAtWord("Pieghe a libro", 90)).toBe("Pieghe a libro");
    const cut = truncateAtWord("Stendi il panetto partendo dal centro, lascia il cornicione intatto e trasferisci sulla pala", 40);
    expect(cut.endsWith("…")).toBe(true);
    expect(cut.length).toBeLessThanOrEqual(41);
    expect(cut).toBe("Stendi il panetto partendo dal centro…");
  });

  it("senza API Notification lo stato è «non supportati», non «attivi»", () => {
    expect(reminderStatus()).toBe("unsupported");
  });
});

describe("FW-16 · utensili", () => {
  it("le cassette per lievitazione confluiscono nei contenitori", () => {
    const state = migrateEquipment({ mixer_type: "hands", surfaces: [], tools: ["proofing_boxes", "containers", "thermometer"] });
    expect(state.tools).toEqual(["containers", "thermometer"]);
  });
});
