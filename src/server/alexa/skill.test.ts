import { beforeAll, describe, expect, it } from "vitest";
import { makeChain, signBody } from "./__fixtures__/pki";
import { handleAlexaRequest } from "./handler";
import { handleAlexaEnvelope, type AlexaResponseBody } from "./skill";
import type { AlexaEnvelope } from "./verify";

/* D-061: la skill risponde a ogni tipo di richiesta come chiede Amazon, con
   SSML, reprompt quando resta aperta e una scheda con il link a Vulcan. */

const BASE = "https://vulcan.test";

function intent(name: string, slots: Record<string, { value?: string; id?: string }> = {}, attributes?: Record<string, unknown>): AlexaEnvelope {
  return {
    version: "1.0",
    session: { new: !attributes, attributes },
    request: {
      type: "IntentRequest",
      locale: "it-IT",
      intent: {
        name,
        slots: Object.fromEntries(Object.entries(slots).map(([slot, { value, id }]) => [slot, {
          name: slot,
          value,
          ...(id ? { resolutions: { resolutionsPerAuthority: [{ status: { code: "ER_SUCCESS_MATCH" }, values: [{ value: { id, name: value } }] }] } } : {}),
        }])),
      },
    },
  };
}

const speech = (r: AlexaResponseBody) => r.response.outputSpeech?.ssml ?? "";

describe("skill Alexa", () => {
  it("LaunchRequest: benvenuto, sessione aperta, reprompt", () => {
    const r = handleAlexaEnvelope({ request: { type: "LaunchRequest", locale: "it-IT" } }, BASE);
    expect(speech(r)).toMatch(/^<speak>Ciao, sono /);
    expect(r.response.shouldEndSession).toBe(false);
    expect(r.response.reprompt?.outputSpeech.ssml).toMatch(/^<speak>/);
  });

  it("RicettaIntent con stile, panetti e forno: SSML, scheda con il link, fine sessione", () => {
    const r = handleAlexaEnvelope(intent("RicettaIntent", {
      stile: { value: "napoletana", id: "napoletana_stg" },
      panetti: { value: "4" },
      forno: { value: "a legna", id: "wood" },
    }), BASE);
    expect(speech(r)).toContain("4 panetti da");
    expect(speech(r)).toContain('<break time="300ms"/>');
    expect(r.response.card?.type).toBe("Simple");
    expect(r.response.card?.content).toContain(`${BASE}/recipe/napoletana_stg?mode=adapted`);
    expect(r.response.shouldEndSession).toBe(true);
    expect(r.response.reprompt).toBeUndefined();
  });

  it("lo slot senza risoluzione si riconosce dal testo detto", () => {
    const r = handleAlexaEnvelope(intent("RicettaIntent", { stile: { value: "la pinsa" } }), BASE);
    expect(speech(r)).toContain("Pinsa Romana");
  });

  it("RicettaIntent senza stile: lo chiede e ricorda panetti e ore; la risposta seguente li usa", () => {
    const ask = handleAlexaEnvelope(intent("RicettaIntent", { panetti: { value: "6" }, ore: { value: "30" } }), BASE);
    expect(speech(ask)).toContain("Quale stile?");
    expect(ask.response.shouldEndSession).toBe(false);
    expect(ask.sessionAttributes).toMatchObject({ pending: "recipe", balls: 6, hours: 30 });
    const answer = handleAlexaEnvelope(intent("RicettaIntent", { stile: { value: "focaccia", id: "focaccia_genovese" } }, ask.sessionAttributes), BASE);
    expect(speech(answer)).toContain("6 focacce da");
    // Un «non ho capito» nel mezzo non perde la domanda in sospeso.
    const lost = handleAlexaEnvelope(intent("AMAZON.FallbackIntent", {}, ask.sessionAttributes), BASE);
    expect(lost.sessionAttributes).toMatchObject({ pending: "recipe", balls: 6 });
  });

  it("ConsigliaIntent: consiglio con le ore dette e domanda di seguito", () => {
    const r = handleAlexaEnvelope(intent("ConsigliaIntent", { ore: { value: "24" }, forno: { value: "di casa", id: "home" } }), BASE);
    expect(speech(r)).toContain("Ti consiglio");
    expect(speech(r)).toContain("Vuoi la ricetta?");
    expect(r.response.shouldEndSession).toBe(false);
    expect(r.sessionAttributes).toMatchObject({ pending: "recipe", hours: 24, kitchen: { ovenType: "home" } });
  });

  it("GlossarioIntent: definizione; termine sconosciuto: lo dice", () => {
    expect(speech(handleAlexaEnvelope(intent("GlossarioIntent", { termine: { value: "biga", id: "biga" } }), BASE))).toContain("Biga.");
    expect(speech(handleAlexaEnvelope(intent("GlossarioIntent", { termine: { value: "appretto" } }), BASE))).toContain("Appretto.");
    expect(speech(handleAlexaEnvelope(intent("GlossarioIntent", { termine: { value: "zzz" } }), BASE))).toContain("non è nel glossario");
  });

  it("Help resta aperto; Stop, Cancel e NavigateHome salutano e chiudono", () => {
    const help = handleAlexaEnvelope(intent("AMAZON.HelpIntent"), BASE);
    expect(help.response.shouldEndSession).toBe(false);
    expect(help.response.reprompt).toBeDefined();
    for (const name of ["AMAZON.StopIntent", "AMAZON.CancelIntent", "AMAZON.NavigateHomeIntent"]) {
      const r = handleAlexaEnvelope(intent(name), BASE);
      expect(speech(r), name).toContain("buona pizza");
      expect(r.response.shouldEndSession, name).toBe(true);
    }
  });

  it("FallbackIntent: non ho capito, con reprompt", () => {
    const r = handleAlexaEnvelope(intent("AMAZON.FallbackIntent"), BASE);
    expect(speech(r)).toContain("Non ho capito");
    expect(r.response.shouldEndSession).toBe(false);
    expect(r.response.reprompt).toBeDefined();
  });

  it("SessionEndedRequest: risposta vuota, senza voce", () => {
    expect(handleAlexaEnvelope({ request: { type: "SessionEndedRequest" } }, BASE)).toEqual({ version: "1.0", response: {} });
  });
});

describe("POST /alexa", () => {
  const SKILL_ID = "amzn1.ask.skill.test";
  const NOW = new Date("2026-10-29T10:00:00Z");
  let chain: Awaited<ReturnType<typeof makeChain>>;
  beforeAll(async () => { chain = await makeChain(NOW); });

  async function post(body: string, init: { method?: string; signature?: string } = {}) {
    const headers = new Headers({ "Content-Type": "application/json", SignatureCertChainUrl: "https://s3.amazonaws.com/echo.api/cert.pem" });
    if (init.signature !== "") headers.set("Signature-256", init.signature ?? await signBody(body, chain.leaf.keys.privateKey));
    const request = new Request(`${BASE}/alexa`, { method: init.method ?? "POST", headers, ...(init.method === "GET" ? {} : { body }) });
    return handleAlexaRequest(request, { skillId: SKILL_ID, now: NOW, fetchCertChain: async () => chain.chainPem, trustAnchorsPem: [chain.root.pem] });
  }

  const launch = JSON.stringify({
    version: "1.0",
    context: { System: { application: { applicationId: SKILL_ID } } },
    request: { type: "LaunchRequest", locale: "it-IT", timestamp: NOW.toISOString() },
  });

  it("richiesta verificata → 200 con la risposta della skill", async () => {
    const res = await post(launch);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("application/json");
    expect(((await res.json()) as AlexaResponseBody).response.outputSpeech?.type).toBe("SSML");
  });

  it("richiesta non verificata → 400", async () => {
    expect((await post(launch, { signature: "" })).status).toBe(400);
    expect((await post(launch.replace(SKILL_ID, "amzn1.ask.skill.other"))).status).toBe(400);
  });

  it("solo POST", async () => {
    expect((await post(launch, { method: "GET" })).status).toBe(405);
  });
});
