import { describe, expect, it } from "vitest";
import { NOTICE_MAX_MS, NOTICE_MIN_MS, NOTICE_UNDO_MS, noticeDurationMs } from "./notice-duration";

describe("durata degli avvisi del ricettario (G5-WP-05)", () => {
  it("un messaggio breve resta almeno 4 s", () => {
    expect(noticeDurationMs("Link copiato", "message")).toBe(NOTICE_MIN_MS);
  });
  it("un messaggio lungo resta di più, fino a 12 s", () => {
    expect(noticeDurationMs("x".repeat(100), "message")).toBe(6000);
    expect(noticeDurationMs("x".repeat(1000), "message")).toBe(NOTICE_MAX_MS);
  });
  it("una rimozione con «Annulla» resta 6 s", () => {
    expect(noticeDurationMs("", "removed")).toBe(NOTICE_UNDO_MS);
  });
});
