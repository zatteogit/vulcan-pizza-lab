import { describe, expect, it } from "vitest";
import {
  escapeLayerDepth,
  handleEscapeKey,
  isTopEscapeLayer,
  pushEscapeLayer,
} from "./escape-stack";

function escape(overrides: Partial<{ key: string; defaultPrevented: boolean; isComposing: boolean }> = {}) {
  const event = {
    key: "Escape",
    defaultPrevented: false,
    isComposing: false,
    ...overrides,
    preventDefault() {
      event.defaultPrevented = true;
    },
  };
  return event;
}

describe("escape-stack (FW-12)", () => {
  it("chiude solo lo strato in cima, poi quello sotto", () => {
    const closed: string[] = [];
    const sheet = pushEscapeLayer(() => closed.push("sheet"));
    const tip = pushEscapeLayer(() => closed.push("tip"));

    expect(tip.isTop()).toBe(true);
    expect(sheet.isTop()).toBe(false);

    const first = escape();
    expect(handleEscapeKey(first)).toBe(true);
    expect(first.defaultPrevented).toBe(true);
    expect(closed).toEqual(["tip"]);

    tip.release();
    expect(sheet.isTop()).toBe(true);
    handleEscapeKey(escape());
    expect(closed).toEqual(["tip", "sheet"]);

    sheet.release();
    expect(escapeLayerDepth()).toBe(0);
  });

  it("non tocca Esc già consumato da un campo o durante la composizione", () => {
    const closed: string[] = [];
    const layer = pushEscapeLayer(() => closed.push("dialog"));

    expect(handleEscapeKey(escape({ defaultPrevented: true }))).toBe(false);
    expect(handleEscapeKey(escape({ isComposing: true }))).toBe(false);
    expect(handleEscapeKey(escape({ key: "Enter" }))).toBe(false);
    expect(closed).toEqual([]);

    layer.release();
  });

  it("senza strati non consuma Esc", () => {
    const event = escape();
    expect(handleEscapeKey(event)).toBe(false);
    expect(event.defaultPrevented).toBe(false);
  });

  it("release è idempotente e toglie lo strato giusto anche fuori ordine", () => {
    const a = pushEscapeLayer(() => {});
    const b = pushEscapeLayer(() => {});
    const c = pushEscapeLayer(() => {});
    b.release();
    b.release();
    expect(isTopEscapeLayer(c.id)).toBe(true);
    c.release();
    expect(isTopEscapeLayer(a.id)).toBe(true);
    a.release();
    expect(escapeLayerDepth()).toBe(0);
  });

  it("uno strato senza onEscape blocca Esc per chi sta sotto", () => {
    const closed: string[] = [];
    const below = pushEscapeLayer(() => closed.push("below"));
    const blocking = pushEscapeLayer();
    expect(handleEscapeKey(escape())).toBe(true);
    expect(closed).toEqual([]);
    blocking.release();
    below.release();
  });
});
