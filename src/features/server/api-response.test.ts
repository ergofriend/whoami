import { describe, expect, it } from "vitest";

import type { ServerInspection } from "./server-inspection";
import { createApiResponse } from "./api-response";

const inspection: ServerInspection = {
  schemaVersion: 1,
  publicIp: { address: null, version: null },
  network: { asn: null, organization: null },
  location: {
    continent: null,
    country: null,
    region: null,
    regionCode: null,
    city: null,
    postalCode: null,
    metroCode: null,
    latitude: null,
    longitude: null,
    timezone: null,
  },
  connection: {
    httpProtocol: null,
    requestPriority: null,
    clientAcceptEncoding: null,
    tcpRttMs: null,
    quicRttMs: null,
  },
  tls: { version: null, cipher: null, clientHelloLength: null },
  cloudflare: { colo: null, rayId: null },
  headers: {
    Accept: null,
    "Accept-Encoding": null,
    "Accept-Language": null,
    "CF-Connecting-IP": null,
    "CF-IPCountry": null,
    "CF-Ray": null,
    Host: null,
    "Sec-CH-UA": null,
    "Sec-CH-UA-Mobile": null,
    "Sec-CH-UA-Platform": null,
    "Upgrade-Insecure-Requests": null,
    "User-Agent": null,
    "X-Forwarded-Proto": null,
  },
};

describe("createApiResponse", () => {
  it("returns the injected inspection as non-cacheable JSON without CORS", async () => {
    const response = createApiResponse(
      new Request("https://whoami.kasu.dev/api.json"),
      () => inspection,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/json; charset=utf-8");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.has("access-control-allow-origin")).toBe(false);
    expect(await response.json()).toMatchObject({ schemaVersion: 1 });
  });

  it("returns a fixed error body without exposing inspector failures", async () => {
    const response = createApiResponse(new Request("https://whoami.kasu.dev/api.json"), () => {
      throw new Error("secret stack");
    });
    const bodyText = await response.text();

    expect(response.status).toBe(500);
    expect(JSON.parse(bodyText)).toEqual({
      schemaVersion: 1,
      error: {
        code: "INTERNAL_ERROR",
        message: "Unable to inspect this request.",
      },
    });
    expect(bodyText).not.toContain("secret stack");
  });
});
