import { describe, expect, it } from "vitest";
import type { RecipeFeedback } from "../../domain/recipe-feedback";
import {
  createRecipeFeedbackStorage,
  type FeedbackStoragePort,
} from "./recipe-feedback-storage";

class MemoryStorage implements FeedbackStoragePort {
  value: string | null = null;
  failNextWrite = false;

  getItem(): string | null {
    return this.value;
  }

  setItem(_key: string, value: string): void {
    if (this.failNextWrite) {
      this.failNextWrite = false;
      throw new Error("quota");
    }
    this.value = value;
  }

  removeItem(): void {
    this.value = null;
  }
}

function entry(id: string): RecipeFeedback {
  return {
    id,
    timestamp: "2026-07-13T12:00:00.000Z",
    recipe: {
      styleId: "napoletana",
      styleName: "Napoletana",
      hydration: 65,
      flourW: 300,
      flourPL: 0.55,
      fermentHours: 24,
      fermentTemp: 20,
      ovenTemp: 450,
      ovenType: "electric_high",
      yeastType: "fresh",
      yeastPct: 0.2,
      skillLevel: 2,
      hasPreFerment: false,
      compensationCount: 0,
      doughBalls: 4,
    },
    predicted: {
      authenticity: 80,
      feasibility: 80,
      digestibility: 80,
      sustainability: 80,
      experimentation: 80,
      composite: 80,
    },
    attempted: true,
    success: true,
    ratings: {
      overall: 4,
      taste: null,
      texture: null,
      difficulty: null,
      authenticity_felt: null,
      digestibility_felt: null,
    },
    issues: [],
    notes: "",
  };
}

describe("recipe feedback browser adapter", () => {
  it("loads, saves, clears and deduplicates imports through an injected port", () => {
    const memory = new MemoryStorage();
    const storage = createRecipeFeedbackStorage(memory);

    storage.save(entry("one"));
    expect(storage.load().map((item) => item.id)).toEqual(["one"]);
    expect(storage.importJson(JSON.stringify({ entries: [entry("one"), entry("two")] }))).toBe(1);
    expect(storage.load().map((item) => item.id)).toEqual(["one", "two"]);

    storage.clear();
    expect(storage.load()).toEqual([]);
  });

  it("keeps the newest half if the primary write exceeds browser quota", () => {
    const memory = new MemoryStorage();
    memory.value = JSON.stringify(
      Array.from({ length: 499 }, (_, index) => entry(`old-${index}`)),
    );
    memory.failNextWrite = true;
    const storage = createRecipeFeedbackStorage(memory);

    storage.save(entry("new"));

    const saved = storage.load();
    expect(saved).toHaveLength(250);
    expect(saved[saved.length - 1]?.id).toBe("new");
  });

  it("treats malformed persisted or imported data as empty", () => {
    const memory = new MemoryStorage();
    memory.value = "not-json";
    const storage = createRecipeFeedbackStorage(memory);

    expect(storage.load()).toEqual([]);
    expect(storage.importJson("not-json")).toBe(0);
  });
});
