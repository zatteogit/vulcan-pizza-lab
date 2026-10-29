import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SCIENCE_NOTES } from "../../data/science-notes";
import { EvidenceBadge } from "../../components/ds";
import { ScienceSheet } from "./science-sheet";
import { WhyButton } from "./why-button";
import { initialLevelFor } from "./use-science-note";
import { uiMessage } from "../../i18n/ui-messages";

/* FW-02 — pattern «Perché?». Render statico (Vitest gira in Node, senza DOM):
 * struttura L1→L2→L3, L3 chiuso di default, nomi accessibili, nessun testo
 * mancante per nessuna nota del registro. Il ritorno del fuoco al pulsante è
 * di use-dialog-focus (verificato nel browser con Playwright). */

const sheet = (props: Partial<Parameters<typeof ScienceSheet>[0]> & { noteId: string }) =>
  renderToStaticMarkup(createElement(ScienceSheet, { open: true, onClose: () => {}, ...props }));

describe("WhyButton", () => {
  it("ha un nome accessibile con il titolo della nota e apre un dialogo", () => {
    const html = renderToStaticMarkup(createElement(WhyButton, { noteId: "yeast-dose" }));
    // Nome accessibile = «Perché: <titolo della nota>» (science.why.ariaLabel).
    expect(html).toContain(`aria-label=${JSON.stringify(uiMessage("science.why.ariaLabel", ["Dose di lievito"]))}`);
    expect(uiMessage("science.why.ariaLabel", ["Dose di lievito"])).toBe("Perché: Dose di lievito");
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain("Perché?");
    expect(html).not.toContain("title=");
    expect(html).not.toContain("style=");
  });

  it("con un'etichetta propria il nome accessibile è il testo visibile", () => {
    const html = renderToStaticMarkup(createElement(WhyButton, { noteId: "stg-reference", label: "Ricetta e disciplinare" }));
    expect(html).toContain("Ricetta e disciplinare");
    expect(html).not.toContain("aria-label=");
  });

  it("una nota inesistente non lascia un pulsante muto", () => {
    expect(renderToStaticMarkup(createElement(WhyButton, { noteId: "non-esiste" }))).toBe("");
  });
});

describe("ScienceSheet", () => {
  it("mostra L1 e L2 con i titoli; il livello 3 parte chiuso", () => {
    const html = sheet({ noteId: "yeast-dose" });
    expect(html).toContain('role="dialog"');
    expect(html).toMatch(/<h2[^>]*>Dose di lievito<\/h2>/);
    expect(html).toMatch(/<h3[^>]*>In breve<\/h3>/);
    expect(html).toContain("È una stima: più ore e più caldo vogliono meno lievito.");
    expect(html).toMatch(/<h3[^>]*>Perché<\/h3>/);
    expect(html).toContain("Come lo calcoliamo");
    expect(html).toContain('aria-expanded="false"');
    // Il contenuto del L3 non è montato finché è chiuso.
    expect(html).not.toContain("Ipotesi del modello");
    expect(html).not.toContain("Fonti");
  });

  it("con initialLevel 3 apre il L3: statuto, formula, variabili, ipotesi, incertezza e fonti", () => {
    const html = sheet({ noteId: "yeast-dose", initialLevel: 3 });
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('data-kind="estimate"');
    expect(html).toContain("Stima");
    expect(html).toContain("Formula");
    expect(html).toContain("percentuale (%)");
    expect(html).toContain("Ipotesi del modello");
    expect(html).toContain("circa ±30");
    expect(html).toContain("Fonti");
    expect(html).toContain("Verificata");
    expect(html).toContain("/learn/glossary#yeast");
  });

  it("i valori di questa ricetta stanno sotto «In questa ricetta»", () => {
    const html = sheet({ noteId: "water-temp-rule", children: createElement("p", null, "Acqua a 18 °C") });
    expect(html).toMatch(/<h3[^>]*>In questa ricetta<\/h3><p>Acqua a 18 °C<\/p>/);
  });

  it("una scelta editoriale senza fonti lo dice, senza inventarne", () => {
    const html = sheet({ noteId: "score-weights", initialLevel: 3 });
    expect(html).toContain('data-kind="editorial"');
    expect(html).toContain("Nessuna fonte esterna: è una scelta di");
  });

  it("ogni nota del registro si apre in italiano, senza chiavi mancanti né fonti smentite", () => {
    for (const note of SCIENCE_NOTES) {
      const html = sheet({ noteId: note.id, initialLevel: 3 });
      expect(html, note.id).toContain('role="dialog"');
      expect(html, note.id).not.toContain("⟦");
      expect(html, note.id).not.toContain('data-status="wrong"');
    }
  });

  it("il livello di partenza segue i dettagli tecnici (D-C)", () => {
    expect(initialLevelFor("essential")).toBe(1);
    expect(initialLevelFor("technical")).toBe(2);
  });
});

describe("EvidenceBadge", () => {
  it("porta forma e testo, mai solo colore", () => {
    for (const kind of ["exact", "estimate", "assumption", "editorial"] as const) {
      const html = renderToStaticMarkup(createElement(EvidenceBadge, { kind, label: kind }));
      expect(html).toContain(`data-kind="${kind}"`);
      expect(html).toContain("<svg");
      expect(html).toContain(`>${kind}</span>`);
      expect(html).not.toContain("style=");
    }
  });
});
