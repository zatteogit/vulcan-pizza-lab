import { describe, expect, it } from "vitest";
import { applyThemeColor } from "./browser-chrome";

function fakeDoc(metas: Array<{ media?: string; content: string }>) {
  const nodes = metas.map((m) => {
    const attrs = new Map<string, string>(m.media ? [["media", m.media]] : []);
    const node = {
      name: "theme-color", content: m.content, parentNode: {} as unknown,
      removeAttribute: (k: string) => { attrs.delete(k); },
      remove: () => { node.parentNode = null; },
      attrs,
    };
    return node;
  });
  const head: unknown[] = [];
  const doc = {
    querySelectorAll: () => nodes.filter((n) => n.parentNode),
    createElement: () => ({ name: "", content: "", parentNode: null, removeAttribute: () => {}, attrs: new Map() }),
    head: { appendChild: (n: { parentNode: unknown }) => { n.parentNode = head; head.push(n); } },
  };
  return { doc: doc as unknown as Document, nodes, head };
}

describe("applyThemeColor", () => {
  it("riduce i meta per chiaro/scuro a uno solo, col colore della pagina e senza media", () => {
    const { doc, nodes } = fakeDoc([{ media: "(prefers-color-scheme: light)", content: "chiaro" }, { media: "(prefers-color-scheme: dark)", content: "scuro" }]);
    applyThemeColor(doc, "pagina-scura");
    const live = nodes.filter((n) => n.parentNode);
    expect(live).toHaveLength(1);
    expect(live[0].content).toBe("pagina-scura");
    expect(live[0].attrs.has("media")).toBe(false);
  });

  it("crea il meta se manca", () => {
    const { doc, head } = fakeDoc([]);
    applyThemeColor(doc, "pagina-chiara");
    expect(head).toHaveLength(1);
  });

  it("senza colore non tocca nulla", () => {
    const { doc, nodes } = fakeDoc([{ content: "chiaro" }]);
    applyThemeColor(doc, null);
    expect(nodes[0].content).toBe("chiaro");
  });
});
