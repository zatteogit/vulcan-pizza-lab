import { afterEach, describe, expect, it } from "vitest";
import { UI_MESSAGES_IT } from "./ui-messages.it";
import {
  registerUiMessages,
  setActiveUiLocale,
  uiMessage,
} from "./ui-messages";
import {
  registerShowcaseMessages,
  showcaseMessage,
} from "./showcase-messages";

afterEach(() => setActiveUiLocale("it"));

describe("uiMessage", () => {
  it("usa la locale attiva e interpola i placeholder posizionali", () => {
    registerUiMessages("en-GB", { "test.greeting": "Hello {0}" });
    setActiveUiLocale("en-GB");

    expect(uiMessage("test.greeting", ["Vulcan"])).toBe("Hello Vulcan");
  });

  it("ricade sul catalogo italiano quando una traduzione manca", () => {
    const [key, italian] = Object.entries(UI_MESSAGES_IT)[0] ?? [];
    expect(key).toBeTruthy();
    setActiveUiLocale("fr-FR");

    expect(uiMessage(key!)).toBe(italian);
  });

  it("mantiene il catalogo showcase lazy separato e allineato alla locale attiva", () => {
    registerShowcaseMessages("en-US", { "test.showcase": "Design {0}" });
    setActiveUiLocale("en-US");

    expect(showcaseMessage("test.showcase", ["system"])).toBe("Design system");
  });
});
