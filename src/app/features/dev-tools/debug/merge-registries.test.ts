import { describe, expect, it } from "vitest";
import type { Annotation } from "./annotation-types";
import {
  activeAnnotations,
  mergeRegistries,
  nextIndex,
  purgeExpiredTombstones,
} from "./merge-registries";

/* Il merge del registro è last-write-wins per `id`: ogni mutazione timbra
   `updatedAt`, le cancellazioni lasciano un tombstone (`deleted`) così la
   rimozione si propaga agli altri layer prima di essere spurgata. */

function anno(over: Partial<Annotation> & { id: string }): Annotation {
  return {
    comment: "",
    selector: "body",
    route: "/",
    elementTag: "div",
    outerHTML: "",
    parentHTML: "",
    timestamp: "",
    viewport: { width: 0, height: 0 },
    elementRect: { top: 0, left: 0, width: 0, height: 0 },
    computedStyles: {
      display: "block",
      position: "static",
      width: "0",
      height: "0",
      padding: "0",
      margin: "0",
      fontSize: "0",
      fontWeight: "normal",
      color: "inherit",
      backgroundColor: "transparent",
      boxShadow: "none",
      zIndex: "auto",
      opacity: "1",
    },
    ...over,
  };
}

describe("mergeRegistries", () => {
  it("tiene la copia con updatedAt più alto per ogni id", () => {
    const local = [anno({ id: "a", comment: "vecchio", updatedAt: 100 })];
    const remote = [anno({ id: "a", comment: "nuovo", updatedAt: 200 })];

    const merged = mergeRegistries(local, remote);
    expect(merged).toHaveLength(1);
    expect(merged[0].comment).toBe("nuovo");
  });

  it("unisce id disgiunti da fonti diverse", () => {
    const merged = mergeRegistries(
      [anno({ id: "a", updatedAt: 1 })],
      [anno({ id: "b", updatedAt: 1 })],
    );
    expect(merged.map((a) => a.id).sort()).toEqual(["a", "b"]);
  });

  it("una cancellazione più recente vince su una modifica più vecchia", () => {
    const merged = mergeRegistries(
      [anno({ id: "a", comment: "modifica", updatedAt: 100 })],
      [anno({ id: "a", deleted: true, updatedAt: 300 })],
    );
    expect(merged[0].deleted).toBe(true);
  });

  it("ignora fonti null/undefined e voci senza id", () => {
    const merged = mergeRegistries(null, undefined, [
      anno({ id: "a", updatedAt: 1 }),
      { id: undefined } as unknown as Annotation,
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe("a");
  });
});

describe("purgeExpiredTombstones", () => {
  const now = 1_000_000_000_000;
  const day = 1000 * 60 * 60 * 24;

  it("mantiene le annotazioni vive", () => {
    const list = [anno({ id: "a", updatedAt: 0 })];
    expect(purgeExpiredTombstones(list, now)).toHaveLength(1);
  });

  it("mantiene i tombstone recenti ma spurga quelli oltre TTL", () => {
    const list = [
      anno({ id: "recente", deleted: true, updatedAt: now - day }),
      anno({ id: "vecchio", deleted: true, updatedAt: now - day * 40 }),
    ];
    const kept = purgeExpiredTombstones(list, now);
    expect(kept.map((a) => a.id)).toEqual(["recente"]);
  });
});

describe("activeAnnotations", () => {
  it("esclude i tombstone e ordina per index", () => {
    const list = [
      anno({ id: "b", index: 2 }),
      anno({ id: "x", deleted: true, index: 1 }),
      anno({ id: "a", index: 1 }),
    ];
    expect(activeAnnotations(list).map((a) => a.id)).toEqual(["a", "b"]);
  });
});

describe("nextIndex", () => {
  it("è max(index) + 1 contando anche i tombstone", () => {
    const list = [
      anno({ id: "a", index: 1 }),
      anno({ id: "b", index: 5, deleted: true }),
    ];
    expect(nextIndex(list)).toBe(6);
  });

  it("parte da 1 su registro vuoto", () => {
    expect(nextIndex([])).toBe(1);
  });
});
