import { describe, expect, it } from "vitest";
import ts from "typescript";

/* I18N-1: una chiamata uiMessage eseguita al caricamento del modulo legge la
   lingua di quel momento (l'italiano) e non cambia più. Le costanti di modulo
   usano un getter: `get label() { return uiMessage("…"); }`. */

const SOURCES = import.meta.glob(
  ["/src/app/**/*.{ts,tsx}", "!/src/app/**/*.test.{ts,tsx}", "!/src/app/i18n/**"],
  { query: "?raw", import: "default", eager: true },
) as Record<string, string>;

function moduleScopeCalls(file: string, source: string): string[] {
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const hits: string[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "uiMessage") {
      let parent: ts.Node | undefined = node.parent;
      while (parent && !ts.isFunctionLike(parent)) parent = parent.parent;
      if (!parent) hits.push(`${file}:${sf.getLineAndCharacterOfPosition(node.getStart()).line + 1}`);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return hits;
}

describe("uiMessage fuori dal caricamento del modulo (I18N-1)", () => {
  it("nessuna chiamata a livello di modulo", () => {
    const hits = Object.entries(SOURCES).flatMap(([file, source]) => moduleScopeCalls(file, source));
    expect(hits).toEqual([]);
  });
});
