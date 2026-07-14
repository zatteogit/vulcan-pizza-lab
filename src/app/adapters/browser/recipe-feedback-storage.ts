import type { RecipeFeedback } from "../../domain/recipe-feedback";

const STORAGE_KEY = "vulcan_recipe_feedback";
const MAX_ENTRIES = 500;

export interface FeedbackStoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface RecipeFeedbackStorage {
  load(): RecipeFeedback[];
  save(entry: RecipeFeedback): void;
  clear(): void;
  importJson(json: string): number;
}

/** Injectable browser adapter; tests can use an in-memory Storage-shaped port. */
export function createRecipeFeedbackStorage(
  storage: FeedbackStoragePort,
): RecipeFeedbackStorage {
  const load = (): RecipeFeedback[] => {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const data: unknown = JSON.parse(raw);
      return Array.isArray(data) ? data as RecipeFeedback[] : [];
    } catch {
      return [];
    }
  };

  return {
    load,
    save(entry) {
      const trimmed = [...load(), entry].slice(-MAX_ENTRIES);
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      } catch {
        const half = trimmed.slice(Math.floor(trimmed.length / 2));
        storage.setItem(STORAGE_KEY, JSON.stringify(half));
      }
    },
    clear() {
      storage.removeItem(STORAGE_KEY);
    },
    importJson(json) {
      try {
        const data: unknown = JSON.parse(json);
        const candidate = data && typeof data === "object" && "entries" in data
          ? (data as { entries?: unknown }).entries
          : data;
        if (!Array.isArray(candidate)) return 0;
        const existing = load();
        const existingIds = new Set(existing.map((entry) => entry.id));
        const newEntries = (candidate as RecipeFeedback[]).filter(
          (entry) => entry.id && !existingIds.has(entry.id),
        );
        const merged = [...existing, ...newEntries].slice(-MAX_ENTRIES);
        storage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return newEntries.length;
      } catch {
        return 0;
      }
    },
  };
}

function browserStorage(): RecipeFeedbackStorage {
  return createRecipeFeedbackStorage(localStorage);
}

export function loadFeedback(): RecipeFeedback[] {
  return browserStorage().load();
}

export function saveFeedback(entry: RecipeFeedback): void {
  browserStorage().save(entry);
}

export function clearAllFeedback(): void {
  browserStorage().clear();
}

export function importFeedbackJSON(json: string): number {
  return browserStorage().importJson(json);
}
